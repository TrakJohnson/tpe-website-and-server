"""
Remake of CFGEN

Plan:
  - generate random CFG and then match to markov (might not be feasible)
  - website
"""

from typing import List, Tuple, Dict
from collections import defaultdict
import random
import codecs
import pickle
from pathlib import Path
import nltk
from nltk import ngrams, PCFG
from nltk.tokenize import sent_tokenize, word_tokenize
import stat_parser
import json
import pprint


pp = pprint.PrettyPrinter()


# -- Text Processing Utility Functions
def get_text(text_name: str, short=False, is_full_path=False) -> str:
    """
    Get the text from a file
    :param text_name: the name of the text (will be searched in corpora/) or a full path
    :param short: if text from corpora, take the short version (if it exists)
    :param is_full_path: set it to True to use a full path instead of corpora folder
    :return: a nice clean string ready to be tokenized
    """
    suffix = "_short" if short else ""
    if is_full_path:
        file_name = text_name
    else:
        file_name = f"corpora/{text_name}{suffix}.txt"
    with codecs.open(file_name, encoding="UTF-8") as f:
        raw_str = f.read()
    # TODO add more rules
    raw_str = bulk_replace(raw_str, [("\"", " "), ("  ", " "), ("_", "")])
    return raw_str


def bulk_replace(s: str, replace_rules: List[Tuple[str, str]]) -> str:
    """to avoid chaining .replace()"""
    for a, b in replace_rules:
        s = s.replace(a, b)
    return s


def clean_output(output: str) -> str:
    return bulk_replace(output, [(" ,", ","), (" .", "."), (" ’ ", "'"), ("( ", "("), (" )", ")")])


def default_to_regular(d):
    if isinstance(d, defaultdict):
        d = {k: default_to_regular(v) for k, v in d.items()}
    return d


# -- Markov chains (aka ngrams)
class MarkovChain:
    def __init__(self, n: int, debug=False):
        self.n = n
        self.memory = {"words": defaultdict(list), "proba": defaultdict(list)}
        self.starting = []
        self.debug = debug

    def learn(self, text: str):
        """
        :param text: text to learn markov chains from
        :return: nothing. just modify the self.memory
        """
        for current_sentence in sent_tokenize(text):
            words = word_tokenize(current_sentence)
            for i, n_tuple in enumerate(ngrams(words, self.n)):
                next_word = ""
                if i == 0:
                    self.starting.append(n_tuple)
                if i + self.n < len(words):
                    next_word = words[i + self.n]
                # we store the next words in memory["words"]
                # and its probability in memory["proba"]
                if next_word not in self.memory["words"][n_tuple]:
                    self.memory["words"][n_tuple].append(next_word)
                    self.memory["proba"][n_tuple].append(1)
                else:
                    self.memory["proba"][n_tuple][
                        self.memory["words"][n_tuple].index(next_word)
                    ] += 1

    def next_word(self, current_state: List[str]) -> dict:
        """
        :param current_state: the last two words
        :return: the next word
        """
        current_ngram = tuple(current_state[-self.n:])
        next_possible = self.memory["words"].get(current_ngram)
        if not next_possible:
            return {"next": "", "pos": 0}

        weights = self.memory["proba"][current_ngram]
        newline = "\n\t"
        self.debug_print(
            f"next possible for {current_ngram}: \n "
            f"{[i + ' ' + str(j) for i, j in zip(next_possible, weights)]}\n"
        )
        return {"next": random.choices(next_possible, weights=weights), "pos": len(next_possible)}

    def get_first_words(self):
        return list(random.choice(self.starting))

    def generate_sentence(self, state: list=None, start_ngram: list=None, counter=100) -> list:
        """
        Generate sentence
        :param state: current progression through the sentence - list of tokens
        :param start_ngram: the ngram we start the sentence with
        :param counter: used to limit sentence length
        :return: progressively build up the sentence - returns full sentence after recursion is over
        """
        if not state:
            if not start_ngram:
                state = self.get_first_words()
            else:
                state = start_ngram
        next_word = self.next_word(state)["next"]
        if next_word == "":
            return state
        state.extend(next_word)

        if not counter:
            return state
        return self.generate_sentence(state=state, counter=counter - 1)

    def get_clean_sentence(self):
        return clean_output(" ".join(self.generate_sentence()))

    def debug_print(self, stuff: str):
        if self.debug:
            print(stuff)

    def save_markov(self, file_path):
        """
        Save the ngram dict and the starting words to file
        :return: nothin'
        """
        with open(file_path, "wb") as f:
            pickle.dump([self.starting, self.memory], f)

    def load_markov(self, file_path):
        with open(file_path, "rb") as f:
            data = pickle.load(f)
        self.starting = data[0]
        self.memory = data[1]


# CFG / PCFG
preprocessed_grammars_path = Path("preprocessed_grammars")


class ContextFreeGrammar:
    def __init__(self):
        self.pcfg_rules = defaultdict(lambda: defaultdict(int))
        self.start_symbols = []

    def learn_text_full(self, text: str) -> None:
        for sentence in sent_tokenize(text):
            self.learn_sentence(sentence)
        self.make_cfg_probabilities()

    def learn_text_sample(self, text: str, samples=100) -> None:
        for sentence in random.sample(set(sent_tokenize(text)), samples):
            self.learn_sentence(sentence)
        self.make_cfg_probabilities()

    def make_cfg_probabilities(self):
        for lhs, value in self.pcfg_rules.items():
            total = value["--TOTAL--"]
            for rhs, num in value.items():
                self.pcfg_rules[lhs][rhs] = round(self.pcfg_rules[lhs][rhs] / total, 3)
            del value["--TOTAL--"]

    def learn_sentence(self, sentence: str) -> None:
        p = stat_parser.Parser()

        has_failed = True
        while has_failed:
            try:
                productions = p.parse(sentence).productions()
                has_failed = False  # no error
            except TypeError:
                pass  # resart the loop

        self.start_symbols.append(productions[0].lhs())

        for production in productions:
            left, right = production.lhs(), production.rhs()
            if len(right) == 1 and type(right[0]) is str:
                right = right[0]
            self.pcfg_rules[left][right] += 1
            self.pcfg_rules[left]["--TOTAL--"] += 1

    def derive_random(self) -> str:
        """
        Derive a random sentence from the rules
        :return: the sentence string
        """
        start_symbol = random.choice(self.start_symbols)
        sentence = [start_symbol]
        continue_derivation = True
        while continue_derivation:
            continue_derivation = not all(isinstance(x, str) for x in sentence)
            for ind, tag in enumerate(sentence):
                if nltk.grammar.is_nonterminal(tag):
                    del sentence[ind]
                    outputs, probas = [], []
                    print(self.pcfg_rules[tag])
                    if "+" in str(tag):
                        tag = nltk.grammar.Nonterminal(random.choice(str(tag).split("+")))
                    print("TAG", tag)
                    for k, v in self.pcfg_rules[tag].items():
                        outputs.append(k)
                        probas.append(v)
                    assert len(probas) == len(outputs) != 0
                    new_choice = random.choices(outputs, weights=probas, k=1)[0]
                    if isinstance(new_choice, str):
                        new_choice = [new_choice]
                    sentence = sentence[ind:] + list(new_choice) + sentence[:ind]
        print(sentence)
        # replace by a randomly weighted choice
        return ""

    def save_pcfg(self, name: str):
        with open(preprocessed_grammars_path / (name + ".pkl"), "wb") as f:
            pickle.dump(default_to_regular(self.pcfg_rules), f)


if __name__ == '__main__':
    m = MarkovChain(n=2, debug=True)
    m.learn(get_text("C:\\Users\\Theo\\Downloads\\meyer_sanitized_1.txt", is_full_path=True))
    sentence = m.get_clean_sentence()
    print(sentence)

# add to text dependency based vs constituency based

