from pathlib import Path
from flask import Flask, render_template, request, jsonify
from flask_cors import CORS
from tpe import *
import json

app = Flask(__name__)
CORS(app)

# setup directories
app_dir = Path(app.root_path)
app.template_folder = app_dir / "build"
app.static_folder = app_dir / "build" / "static"
root_dir = app_dir


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

    if complete_sentence:
        current = m.generate_sentence(current)
    elif not current:
        current = m.get_first_words()
    else:
        current.extend(m.next_word(current)["next"])

    return jsonify({
        "currentSentence": current
    })


@app.route("/generate_pcfg", methods=["POST"])
def generate_pcfg():
    request_data = json.loads(request.data)
    text_name = request_data.get("textName")
    left_most = request_data.get("leftMost")

    gra = ContextFreeGrammar(root_path=root_dir, debug=True)
    try:
        gra.load_pcfg(text_name)
    except FileNotFoundError:
        print(f"'{text_name}' hasn't been pickled yet")
        gra.learn_text_sample(gra.get_text(text_name))  # TODO subprocess
        gra.save_pcfg(text_name)

    current = gra.derive(left_most=left_most)

    return jsonify({
        "currentSentence": current
    })


if __name__ == '__main__':
    app.run()
