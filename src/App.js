import React, {Component} from 'react';
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
const ROOT_LINK = process.env.NODE_ENV === "production" ? "" : "http://127.0.0.1:5000";


function bulkReplace(retStr, obj) {
    let regex;
    for (let x in obj) {
        if (obj.hasOwnProperty(x)) {
            regex = new RegExp(x, "g");
            retStr = retStr.replace(regex, obj[x]);
        }
    }
    return retStr;
}

function cleanText(text) {
    return bulkReplace(text, {
        " \\,": ",", " \\.": ".", " ’ ": "'",
        "\\( ": "(", " \\)": ")"
    })
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

        this.getText = this.getText.bind(this);
        this.clear = this.clear.bind(this);
    }

    getText(completeSentence) {
        console.log(completeSentence);
        let requestBody = JSON.stringify({
            textName: this.state.textName,
            current: this.state.currentText,
            n: this.state.n,
            completeSentence: completeSentence
        });
        console.log(requestBody);

        fetch(ROOT_LINK + '/generate_markov', {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: requestBody
        }).then(
            resp => resp.json()
        ).then((jsonResp) => {
            this.setState({
                currentText: jsonResp["currentSentence"]
            });
            console.log(jsonResp)
        }).catch(err => console.log("FETCH FAILURE " + err))
    }

    clear() {
        this.setState({currentText: []})
    }

    render() {
        return <div id="markov-wrapper">
            <button onClick={() => this.getText(false)}>Générer le mot suivant</button>
            <button onClick={() => this.getText(true)}>Générer toute la phrase</button>
            <button onClick={this.clear}>Clear</button>
            <br/>
            <textarea readOnly={true} id="generated-text"
                      value={cleanText(this.state.currentText.join(" "))}/>
            <br/>
            <select value={this.state.textName} onChange={(e) => this.setState({textName: e.target.value})}>
                {TEXT_NAMES.map((textName) => <option key={textName}>{textName}</option>)}
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
            currentText: "",
            textName: "darwin",
        };

        this.getText = this.getText.bind(this);
        this.clear = this.clear.bind(this);
    }

    getText() {
        let requestBody = JSON.stringify({
            textName: this.state.textName
        });
        console.log(requestBody);

        fetch(ROOT_LINK + '/generate_pcfg', {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: requestBody
        }).then(
            resp => resp.json()
        ).then((jsonResp) => {
            this.setState({
                currentText: jsonResp["currentSentence"]
            });
        }).catch((err) => console.log("FETCH FAILURE " + err))
    }

    clear() {
        this.setState({currentText: ""})
    }

    render() {
        return <div id="pcfg-wrapper">
            <button onClick={() => this.getText(true)}>Générer toute la phrase</button>
            <button onClick={this.clear}>Clear</button>
            <br/>
            <textarea readOnly={true} id="generated-text" value={cleanText(this.state.currentText)}/>
            <br/>
            <select value={this.state.textName} onChange={(e) => this.setState({textName: e.target.value})}>
                {TEXT_NAMES.map((textName) => <option key={textName}>{textName}</option>)}
            </select>
        </div>;
    }
}


export default App;
