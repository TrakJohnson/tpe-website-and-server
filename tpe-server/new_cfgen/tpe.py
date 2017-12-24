"""
Remake of CFGEN

Plan:
  - generate random CFG and then match to markov (might not be feasible)
  - website
"""

from typing import List, Tuple, Dict
from nltk.tokenize import sent_tokenize, word_tokenize
from nltk import ngrams
from collections import defaultdict
import random
import stat_parser
import codecs
import pickle


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
    with codecs.open(file_name) as f:
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


# CFG
class ContextFreeGrammar:
    def __init__(self):
        self.grammar = []

    def learn(self, text: str) -> None:
        p = stat_parser.Parser()
        self.grammar.extend(p.parse(text).productions())

    def derive_random(self, start_symbol=""):
        pass


if __name__ == '__main__':
    m = MarkovChain(n=2, debug=True)
    m.learn(get_text("darwin"))
    sentence = m.get_clean_sentence()
    print(sentence)
