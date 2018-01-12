import React, { Component } from 'react';
import './App.css';

// TODO make text names more consistent and displayable
const TEXT_NAMES = [
    "darwin",
    "frankenstein",
    "oldmanandthesea",
    "trump_speeches",
    "ulysses_ed11",
    "war_and_peace",
];


function bulkReplace(retStr, obj) {
    for (let x in obj) {
        retStr = retStr.replace(x, obj[x]);
    }
    return retStr;
}

function cleanText(text) {
    return bulkReplace(text, {" ,": ",", " .": ".", " ’ ": "'", "\( ": "\(", " \)": "\)"})
}


class App extends Component {

    render() {
        return (
        <div className="wrapper">
            <div id="menu-bar">
                <div id="page-title">
                    Projet TPE
                </div>
                <div id="menu">

                </div>
            </div>
            <div id="content">
                <Markov/>
                <br/><br/>
                <hr/>
                <br/><br/>
                <PCFG/>
                <hr/>
                <div>
                    1 - Introduction <br/>
                    2 - Chaînes de markov <br/>
                    3 - Grammaire sans contexte <br/>
                    4 - Explication de l'algorithme <br/>
                    5 - Exemples de textes générés <br/>
                    6 - Applications et intérêt
                </div>
            </div>
        </div>
        );
    }
}


class Markov extends Component {
    constructor() {
        super();
        this.state = {
            currentText: [],
            textName: "darwin",
            n: 2,
        };
        this.rootLink = process.env.NODE_ENV === "production" ? "" : "http://127.0.0.1:5000";

        this.getText = this.getText.bind(this);
        this.clear = this.clear.bind(this);
    }

    static cleanText(someText) {
        return bulkReplace(someText, {" ,": ",", " .": ".", " ’ ": "'", "\( ": "\(", " \)": "\)"})
    }

    getText(completeSentence) {
        console.log(completeSentence);
        let request_body = JSON.stringify({
            text_name: this.state.text_name,
            current: this.state.current_text,
            n: this.state.n,
            complete_sentence: completeSentence
        });
        console.log(request_body);

        fetch(this.root_link + '/generate_markov', {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: request_body
        }).then(
            resp => resp.json()
        ).then(json_resp => {
            this.setState({
                current_text: json_resp["current_sentence"]
            });
            console.log(json_resp)
        }).catch(err => console.log("FETCH FAILURE " + err))
    }

    clear() {
        this.setState({current_text: []})
    }

    render() {
        return <div id="markov-wrapper">
            <button onClick={() => this.getText(false)}>Générer le mot suivant</button>
            <button onClick={() => this.getText(true)}>Générer toute la phrase</button>
            <button onClick={this.clear}>Clear</button>
            <br/>
            <textarea readOnly={true} id="generated-text"
                      value={cleanText(this.state.current_text.join(" "))}/>
            <br/>
            <select value={this.state.text_name} onChange={(e) => this.setState({text_name: e.target.value})}>
                {TEXT_NAMES.map((text_name) => <option key={text_name}>{text_name}</option>)}
            </select>
            <input type="range"
                   name="n-gram size"
                   min={1}
                   max={4}
                   value={this.state.n}
                   onChange={(e) => this.setState({n: Number(e.target.value)}, this.clear)}
            />
            {this.state.n}
        </div>;
    }
}

class PCFG extends Component {
    constructor() {
        super();
        this.state = {
            current_text: "",
            text_name: "darwin",
        };
        this.root_link = process.env.NODE_ENV === "production" ? "" : "http://127.0.0.1:5000";

        this.getText = this.getText.bind(this);
        this.clear = this.clear.bind(this);
    }

    getText() {
        let request_body = JSON.stringify({
            text_name: this.state.text_name
        });
        console.log(request_body);

        fetch(this.root_link + '/generate_pcfg', {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: request_body
        }).then(
            resp => resp.json()
        ).then(json_resp => {
            this.setState({
                current_text: json_resp["current_sentence"]
            });
            console.log(json_resp)
        }).catch(err => console.log("FETCH FAILURE " + err))
    }

    clear() {
        this.setState({current_text: ""})
    }

    render() {
        return <div id="pcfg-wrapper">
            <button onClick={() => this.getText(true)}>Générer toute la phrase</button>
            <button onClick={this.clear}>Clear</button>
            <br/>
            <textarea readOnly={true} id="generated-text" value={cleanText(this.state.current_text)}/>
            <br/>
            <select value={this.state.text_name} onChange={(e) => this.setState({text_name: e.target.value})}>
                {TEXT_NAMES.map((text_name) => <option key={text_name}>{text_name}</option>)}
            </select>
        </div>;
    }
}



export default App;
