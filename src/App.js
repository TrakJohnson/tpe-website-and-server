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
    }

    static cleanText(someText) {
        return bulkReplace(someText, {" ,": ",", " .": ".", " ’ ": "'", "\( ": "\(", " \)": "\)"})
    }

    getText() {
        let request_body = JSON.stringify({
            text_name: "darwin",
            current: this.state.current_text,
            n: 2
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
                <button onClick={this.getText.bind(this)}>Générer le mot suivant</button>
                <button onClick={this.getText.bind(this)}>Générer toute la phrase</button>
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
