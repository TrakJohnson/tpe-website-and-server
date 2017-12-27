import React, { Component } from 'react';
import './App.css';


function bulkReplace(retStr, obj) {
    for (let x in obj) {
        retStr = retStr.replace(x, obj[x]);
    }
    return retStr;
}

class App extends Component {
    constructor() {
        super();
        this.state = {current_text: []};
        this.root_link = "http://127.0.0.1:5000";

        this.getText = this.getText.bind(this);
        this.clear = this.clear.bind(this);
    }

    static cleanText(someText) {
        return bulkReplace(someText, {" ,": ",", " .": ".", " ’ ": "'", "\( ": "\(", " \)": "\)"})
    }

    getText(completeSentence) {
        console.log(completeSentence);
        let request_body = JSON.stringify({
            text_name: "darwin",
            current: this.state.current_text,
            n: 2,
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
                current_text: json_resp.current_sentence
            });
            console.log(json_resp)
        }).catch(err => console.log("FETCH FAILURE " + err))
    }

    clear() {
        this.setState({current_text: []})
    }

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
                Générateur
                <button onClick={() => this.getText(false)}>Générer le mot suivant</button>
                <button onClick={() => this.getText(true)}>Générer toute la phrase</button>
                <button onClick={this.clear}>Clear</button>
                <br/>
                <textarea readOnly={true} value={App.cleanText(this.state.current_text.join(" "))} id="generated-text"/>
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

export default App;
