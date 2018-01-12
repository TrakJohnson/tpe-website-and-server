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
import operator
import json
import pprint
import nltk
# TODO nltk.download('punkt')
from nltk import ngrams, PCFG
from nltk.tokenize import sent_tokenize, word_tokenize
import stat_parser


pp = pprint.PrettyPrinter()
grammar_dir = Path("preprocessed_grammars")
ngram_dir = Path("preprocessed_ngrams")


# -- Text Processing Utility Functions
def get_text(text_name: str, short=False, is_full_path=False, corpora_path=Path("corpora")) -> str:
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
        file_name = corpora_path / f"{text_name}{suffix}.txt"
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
    def __init__(self, n: int, debug=False, storage_root=ngram_dir):
        self.n = n
        self.memory = {"words": defaultdict(list), "proba": defaultdict(list)}
        self.starting = []
        self.debug = debug
        self.storage_root = storage_root

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

    def save_markov(self, name: str):
        """
        Save the ngram dict and the starting words to file
        :return: nothin'
        """
        with open(self.storage_root / f"{name}_{self.n}.pkl", "wb") as f:
            pickle.dump([self.starting, self.memory], f)

    def load_markov(self, name):
        with open(self.storage_root / f"{name}_{self.n}.pkl", "rb") as f:
            data = pickle.load(f)
        self.starting, self.memory = data


# CFG / PCFG
class ContextFreeGrammar:
    def __init__(self, debug=False, storage_root=grammar_dir):
        self.pcfg_rules = defaultdict(lambda: defaultdict(int))
        self.start_symbols = []
        self.debug = debug
        self.storage_root = storage_root

    def debug_print(self, *args, **kwargs):
        if self.debug:
            print(*args, **kwargs)

    def learn_text_full(self, text: str) -> None:
        for sentence in sent_tokenize(text):
            self.learn_sentence(sentence)
        self.make_cfg_probabilities()

    def learn_text_sample(self, text: str, samples=100) -> None:
        for ind, sentence in enumerate(random.sample(set(sent_tokenize(text)), samples)):
            print(ind, len(sentence))
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

    def derive(self, left_most=False) -> str:
        """
        Derive a random sentence from the rules
        :arg left_most: if true, only take the most probable rhs instead of random with weights
        :return: the sentence string
        """
        start_symbol = random.choice(self.start_symbols)
        if "+" in str(start_symbol):
            # TODO really make this work correctly
            sentence = [nltk.grammar.Nonterminal(i) for i in str(start_symbol).split("+")]
        else:
            sentence = [start_symbol]
        pp.pprint(self.pcfg_rules)
        self.debug_print("STARTING POINT", sentence)
        continue_derivation = True
        while continue_derivation:
            ind = 0
            total = len(sentence)
            while ind < total:
                tag = sentence[ind]
                if nltk.grammar.is_nonterminal(tag):
                    del sentence[ind]
                    outputs, probas = [], []
                    self.debug_print("TAG:", tag)
                    self.debug_print("AVAILABLE:", self.pcfg_rules[tag])
                    for k, v in self.pcfg_rules[tag].items():
                        outputs.append(k)
                        probas.append(v)
                    assert len(probas) == len(outputs) != 0

                    if left_most:
                        max_choice_index, _ = max(enumerate(probas), key=operator.itemgetter(1))
                        new_choice = outputs[max_choice_index]
                    else:
                        new_choice = random.choices(outputs, weights=probas, k=1)[0]

                    if isinstance(new_choice, str):
                        new_choice = [new_choice]
                    sentence[ind:ind] = list(new_choice)
                ind += 1

            # check if derivation needs to be continued
            continue_derivation = not all(isinstance(x, str) for x in sentence)
            self.debug_print("SENTENCE : ", sentence)

        # replace by a randomly weighted choice
        return " ".join(sentence)

    def save_pcfg(self, name: str) -> None:
        with open(self.storage_root / f"{name}.pkl", "wb") as f:
            pickle.dump([
                default_to_regular(self.start_symbols),
                default_to_regular(self.pcfg_rules)
            ], f)

    def load_pcfg(self, name: str) -> None:
        with open(self.storage_root / f"{name}.pkl", "rb") as f:
            print("LOAD PCFG", self.storage_root / f"{name}.pkl")
            self.start_symbols, self.pcfg_rules = pickle.load(f)


if __name__ == '__main__':
    grammar = ContextFreeGrammar()
    grammar.learn_text_sample(get_text("war_and_peace"), 1)
    grammar.derive()
# add to text dependency based vs constituency based

