"""
A sentence generator based on Markov Chains and Context Free Grammar
"""

# system
import codecs
import pickle
from pathlib import Path
from pprint import pprint
# types
import json
import operator
from typing import List, Tuple, Dict
from collections import defaultdict
# language
import nltk
from nltk import ngrams, PCFG
from nltk.tokenize import sent_tokenize, word_tokenize
import stat_parser
# other
import random
import math
import uuid


# Check for required resources
try:
    nltk.data.find('tokenizers/punkt')
except LookupError:
    nltk.download('punkt')


def bulk_replace(s: str, replace_rules: List[Tuple[str, str]]) -> str:
    """to avoid chaining .replace()"""
    for a, b in replace_rules:
        s = s.replace(a, b)
    return s


def clean_output(output: str) -> str:
    return bulk_replace(output, [(" ,", ","), (" .", "."), (" ’ ", "'"), ("( ", "("), (" )", ")")])


def default_to_regular(d: defaultdict) -> dict:
    if isinstance(d, defaultdict):
        d = {k: default_to_regular(v) for k, v in d.items()}
    return d


class CustomNonTerminal:
    def __init__(self, anything: str):
        self.s = str(anything)
        self.unique_id = uuid.uuid4()

    def __str__(self):
        return self.s

    def __repr__(self):
        return self.s

    def __hash__(self):
        return hash(self.s)

    def __eq__(self, other):
        return self.s == other.s


class Graph:
    graph: dict

    def __init__(self):
        self.graph = {"nodes": [], "links": []}

    def __str__(self):
        return str(self.graph)

    def add_node(self, node: str):
        self.graph["nodes"].append(node)

    def add_unique_node(self, node: str, unique_id: str):
        self.add_node(node + "--" + str(unique_id))

    def add_link(self, source: str, target: str):
        self.graph["links"].append({"source": source, "target": target})


class AbstractTextGenerator:
    def __init__(self, root_path: Path):
        self.root_path = root_path

    def get_text(self, text_name: str, short=False, is_full_path=False):
        """Get the text from a file.

        :param text_name: the name of the text (will be searched in corpora/) or a full path
        :param short: if text from corpora, take the short version (if it exists)
        :param is_full_path: set it to True to use a full path instead of corpora folder
        :return: a nice clean string ready to be tokenized
        """
        suffix = "_short" if short else ""
        if is_full_path:
            file_name = text_name
        else:
            file_name = self.root_path / "corpora" / f"{text_name}{suffix}.txt"
        with codecs.open(file_name, encoding="UTF-8") as f:
            raw_str = f.read()
        # TODO add more rules
        raw_str = bulk_replace(raw_str, [("\"", " "), ("  ", " "), ("_", "")])
        return raw_str


# -- Markov chains (aka ngrams)
class MarkovChain(AbstractTextGenerator):
    def __init__(self, n: int, root_path: Path, debug=False):
        super().__init__(root_path)
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

    def next_word(self, current_state: List[str], random_choice=True) -> dict:
        """
        :param random_choice: if false, take max. if true, take weighted random
        :param current_state: the last two words
        :return: the next word
        """
        current_ngram = tuple(current_state[-self.n:])
        next_possible = self.memory["words"].get(current_ngram)
        print(current_ngram)
        if not next_possible:
            print("ABORT")
            return {"next": "", "pos": 0}

        weights = self.memory["proba"][current_ngram]
        newline = "\n\t"
        self.debug_print(
            f"next possible for {current_ngram}: \n "
            f"{[i + ' ' + str(j) for i, j in zip(next_possible, weights)]}\n"
        )

        next_possible_word_and_weight = sorted(list(zip(
            next_possible, ["{0:.2f}".format(100*i/sum(weights)) for i in weights]
        )), key=lambda x: float(x[1]))[::-1]

        if random_choice:
            next_word = random.choices(next_possible, weights=weights)
        else:
            next_word = [next_possible_word_and_weight[0][0]]

        return {
            "next": next_word,
            "pos": len(next_possible),
            "possibleNextWords": next_possible_word_and_weight
        }

    def get_first_words(self):
        return list(random.choice(self.starting))

    def generate_sentence(self, state: list = None, start_ngram: list = None, counter=100, random_choice=True) -> list:
        """
        Generate sentence.
        :param random_choice: passed on to the self.next_word method
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
        next_word = self.next_word(state, random_choice=random_choice)["next"]
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
        Save the ngram dict and starting ngrams to file.
        :param name: name of file
        :return: None
        """
        with open(self.root_path / "preprocessed_ngrams" / f"{name}_{self.n}.pkl", "wb") as f:
            pickle.dump([self.starting, self.memory], f)

    def load_markov(self, name):
        """Load the ngram dict and starting ngrams from file.

        :param name: name of file
        :return: None
        """
        with open(self.root_path / "preprocessed_ngrams" / f"{name}_{self.n}.pkl", "rb") as f:
            data = pickle.load(f)
        self.starting, self.memory = data


# CFG / PCFG
class ContextFreeGrammar(AbstractTextGenerator):
    def __init__(self, root_path: Path, debug=False):
        super().__init__(root_path)
        self.pcfg_rules = defaultdict(lambda: defaultdict(int))
        self.start_symbols = []
        self.debug = debug

    def debug_print(self, *args, pp=False):
        if self.debug:
            if pp:
                pprint(args[0])
            else:
                print(*args)

    def learn_text_full(self, text: str) -> None:
        for sentence in sent_tokenize(text):
            self.learn_sentence(sentence)
        self.make_cfg_probabilities()

    def learn_text_sample(self, text: str, samples=100) -> None:
        for ind, sentence in enumerate(random.sample(set(sent_tokenize(text)), samples)):
            print(ind, len(sentence), samples)
            self.learn_sentence(sentence)
        self.make_cfg_probabilities()

    def make_cfg_probabilities(self):
        for lhs, value in self.pcfg_rules.items():
            assert type(lhs) is CustomNonTerminal
            total = value["--TOTAL--"]
            for rhs, num in value.items():
                self.pcfg_rules[lhs][rhs] = round(self.pcfg_rules[lhs][rhs] / total, 4)
            del value["--TOTAL--"]

    def learn_sentence(self, sentence: str, no_long_sentences=True) -> None:
        if no_long_sentences and len(sentence) > 500:
            return

        p = stat_parser.Parser()
        assert all(type(i) is CustomNonTerminal for i in iter(self.pcfg_rules.keys()))
        has_failed = True
        while has_failed:
            try:
                productions = p.parse(sentence).productions()
                has_failed = False  # no error
            except TypeError:
                pass  # restart the loop

        self.start_symbols.append(CustomNonTerminal(productions[0].lhs()))

        assert all(type(i) is CustomNonTerminal for i in self.start_symbols)

        for production in productions:
            left, right = CustomNonTerminal(production.lhs()), production.rhs()
            if len(right) == 1 and type(right[0]) is str:
                right = right[0]
            else:
                right = tuple(CustomNonTerminal(i) for i in right)
            self.pcfg_rules[left][right] += 1
            self.pcfg_rules[left]["--TOTAL--"] += 1

    def derive(self, left_most=False) -> dict:
        """Derive a random sentence from the rules.

        :param left_most: if true, only take the most probable rhs instead of random with weights
        :return: the sentence string
        """
        start_symbol = random.choice(self.start_symbols)
        print(str(start_symbol))
        if "+" in str(start_symbol) and CustomNonTerminal(start_symbol) not in self.pcfg_rules.keys():
            sentence = [CustomNonTerminal(i) for i in str(start_symbol).split("+")]
        else:
            sentence = [CustomNonTerminal(start_symbol)]
        print(sentence)
        self.debug_print(self.pcfg_rules, pp=True)
        self.debug_print("STARTING POINT", sentence)
        continue_derivation = True
        current_csv = ["parent,child,actualName"]
        while continue_derivation:
            ind = 0
            total = len(sentence)
            while ind < total:
                tag = sentence[ind]
                print("CURRENT TAG", tag)
                if type(tag) is CustomNonTerminal:
                    del sentence[ind]
                    outputs, probas = [], []
                    self.debug_print("CURRENT TAG:", tag)
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
                    print("THE SOURCE")
                    print(tag, type(tag))
                    print("THE CHOICE")
                    print(new_choice, type(new_choice))
                    # building the csv TODO refactor cause its ugly
                    source = f"{tag}---{tag.unique_id}"
                    if type(new_choice) is tuple:
                        for i in new_choice:
                            target = f"{i}---{i.unique_id}"
                            current_csv.append(",".join([source, target, str(i)]))
                    else:
                        if type(new_choice) is str:
                            target = new_choice
                        elif type(new_choice) is CustomNonTerminal:
                            target = f"{new_choice}---{new_choice.unique_id}"
                        else:
                            raise Exception(f"THIS SHOULDN'T HAPPEN {type(new_choice)}")
                        current_csv.append(",".join([source, target, str(new_choice)]))

                    if isinstance(new_choice, str):
                        new_choice = [new_choice]
                    sentence[ind:ind] = list(new_choice)
                ind += 1

            # check if derivation needs to be continued
            continue_derivation = not all(isinstance(x, str) for x in sentence)
            self.debug_print("SENTENCE : ", sentence)
            print(current_csv)

        # replace by a randomly weighted choice
        return {"sentence": " ".join(sentence), "csv": "\n".join(current_csv)}

    def save_pcfg(self, name: str) -> None:
        file_path = self.root_path / "preprocessed_grammars" / f"{name}.pkl"
        with open(file_path, "wb") as f:
            pickle.dump([
                default_to_regular(self.start_symbols),
                default_to_regular(self.pcfg_rules)
            ], f)

    def load_pcfg(self, name: str) -> None:
        file_path = self.root_path / "preprocessed_grammars" / f"{name}.pkl"
        with open(file_path, "rb") as f:
            self.start_symbols, self.pcfg_rules = pickle.load(f)