from tpe import *


def test_get_text():
    assert len(get_text("frankenstein", short=True)) == 24453


def test_bulk_replace():
    assert bulk_replace("1_2_3_2_1", [("_", "*"), ("2", "4")]) == "1*4*3*4*1"


def test_markov_chain():
    m = MarkovChain(n=3)
    m.learn(get_text("war_and_peace"))
    assert m.generate_sentence()


def test_cfg():
    c = ContextFreeGrammar()
    c.learn("My name is John, I like cats.")
    print(c.cfg)


def test_clean_output():
    assert clean_output("Hello . my name , is john") == "Hello. my name, is john"
