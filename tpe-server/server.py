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
ngram_dir = corpora_dir.parent / "saved_ngrams"


@app.route("/")
def homepage():
    return render_template("index.html")


@app.route("/generate_markov", methods=["POST"])
def generate_markov():
    request_data = json.loads(request.data)
    text_name = request_data.get("text_name")
    current = request_data.get("current")
    n = request_data.get("n")
    complete_sentence = request_data.get("complete_sentence")

    assert len(current) >= n or len(current) == 0
    m = MarkovChain(n=n)
    ngram_file_path = f"{str(ngram_dir)}\\{text_name}.pkl"  # TODO convert that to Path only

    try:
        m.load_markov(ngram_file_path)
    except FileNotFoundError:
        print(f"'{text_name}' hasn't been pickled yet")
        m.learn(get_text(f"{str(corpora_dir)}\\{text_name}.txt", is_full_path=True))
        m.save_markov(ngram_file_path)
        print("Learning done.")

    if complete_sentence:
        current = m.generate_sentence(current)
    elif not current:
        current = m.get_first_words()
    else:
        current.extend(m.next_word(current)["next"])

    print(current)
    return jsonify({
        "current_sentence": current
    })


if __name__ == '__main__':
    app.run()
