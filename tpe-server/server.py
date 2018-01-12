from pathlib import Path
from flask import Flask, render_template, request, jsonify
from flask_cors import CORS
from tpe import *
import json

app = Flask(__name__)
CORS(app)

# setup directories
app_dir = Path(app.root_path)
app.template_folder = app_dir.parent / "build"
app.static_folder = app_dir.parent / "build" / "static"
corpora_dir = app_dir.parent / "tpe-server" / "new_cfgen" / "corpora"
ngram_dir = corpora_dir.parent / "preprocessed_ngrams"
pcfg_dir = corpora_dir.parent / "preprocessed_grammars"


@app.route("/")
def homepage():
    return render_template("index.html")


@app.route("/generate_markov", methods=["POST"])
def generate_markov():
    request_data = json.loads(request.data)
    text_name = request_data.get("textName")
    current = request_data.get("current")
    n = request_data.get("n")
    complete_sentence = request_data.get("completeSentence")

    assert len(current) >= n or len(current) == 0
    m = MarkovChain(n=n, storage_root=ngram_dir)

    try:
        m.load_markov(text_name)
    except FileNotFoundError:
        print(f"'{text_name}' hasn't been pickled yet")
        m.learn(get_text(f"{corpora_dir / text_name}.txt", is_full_path=True))
        m.save_markov(text_name)
        print("Learning done.")

    if complete_sentence:
        current = m.generate_sentence(current)
    elif not current:
        current = m.get_first_words()
    else:
        current.extend(m.next_word(current)["next"])

    return jsonify({
        "current_sentence": current
    })


@app.route("/generate_pcfg", methods=["POST"])
def generate_pcfg():
    request_data = json.loads(request.data)
    text_name = request_data.get("text_name")
    left_most = request_data.get("left_most")

    pcfg_file_path = f"{pcfg_dir / text_name}.pkl"
    gra = ContextFreeGrammar(storage_root=pcfg_dir)
    print("file path", pcfg_file_path)
    try:
        gra.load_pcfg(text_name)
    except FileNotFoundError:
        print(f"'{text_name}' hasn't been pickled yet")
        gra.learn_text_sample(get_text(text_name, corpora_path=corpora_dir))
        gra.save_pcfg(text_name)

    current = gra.derive(left_most=left_most)

    return jsonify({
        "currentSentence": current
    })


if __name__ == '__main__':
    app.run()
