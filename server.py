from pathlib import Path
from flask import Flask, render_template, request, jsonify, send_from_directory
from flask_cors import CORS
from tpe import *
import json

app = Flask(__name__)
CORS(app)

# setup directories
app_dir = Path(app.root_path)
app.template_folder = app_dir / "build"
app.static_folder = app_dir / "build" / "static"
root_dir = app_dir / "data"


@app.route("/")
def homepage():
    return render_template("index.html")


@app.route("/favicon.ico")
def get_favicon():
    return send_from_directory(app.template_folder, "favicon.ico")


@app.route("/generate_markov", methods=["POST"])
def generate_markov():
    request_data = json.loads(request.data)
    text_name = request_data.get("textName")
    current = request_data.get("current")
    n = request_data.get("n")
    complete_sentence = request_data.get("completeSentence")
    random_choice = bool(request_data.get("randomChoice"))
    print(text_name)
    assert len(current) >= n or len(current) == 0
    m = MarkovChain(n=n, root_path=root_dir)

    try:
        m.load_markov(text_name)
    except FileNotFoundError:
        print(f"'{text_name}' hasn't been pickled yet")
        m.learn(m.get_text(text_name))
        m.save_markov(text_name)
        print("Learning done.")

    other_next_words = None
    if complete_sentence:
        current = m.generate_sentence(current)
    elif not current:
        current = m.get_first_words()
    else:
        print("RANDOM CHOICE", random_choice)
        data = m.next_word(current, random_choice=random_choice)
        other_next_words = data.get("possibleNextWords")
        current.extend(data["next"])

    return jsonify({
        "currentSentence": current,
        "possibleNextWords": other_next_words
    })


@app.route("/generate_pcfg", methods=["POST"])
def generate_pcfg():
    request_data = json.loads(request.data)
    text_name = request_data.get("textName")
    left_most = request_data.get("leftMost")

    gra = ContextFreeGrammar(root_path=root_dir, debug=False)
    try:
        gra.load_pcfg(text_name)
    except FileNotFoundError:
        print(f"'{text_name}' hasn't been pickled yet")
        gra.learn_text_sample(gra.get_text(text_name))  # TODO subprocess
        gra.save_pcfg(text_name)

    current = gra.derive(left_most=left_most)

    return jsonify({
        "currentSentence": current["sentence"],
        "csv": current["csv"]
    })


if __name__ == '__main__':
    app.run()
