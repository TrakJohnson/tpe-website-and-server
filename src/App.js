import React, {Component} from 'react';
import './App.css';


// TODO make text names more consistent and displayable
const TEXT_NAMES = [
    "darwin",
    "frankenstein",
    "old_man_and_the_sea",
    "trump_speeches",
    "ulysses_ed11",
    "war_and_peace",
];
const ROOT_LINK = process.env.NODE_ENV === "production" ? "" : "http://127.0.0.1:5000";


export function cleanText(text) {
    return String(text)
        .replace(/’/g, "'")
        .replace(/ ([,.:;)?!])\s?/g, "$1 ")  // strip spaces before these characters
        .replace(/\s?([(]) /g, " $1")  // strip spaces after these characters
        /*.replace(/\s?(['])\s?/g, "$1")  // strip spaces before and after these characters*/
        .replace(/^\s/, "")
        .replace(/\s$/, "")
}


class App extends Component {

    render() {
        return (
            <div className="wrapper">
                <div id="menu-bar">
                    <div id="page-title">
                        Sentence Generator
                    </div>
                    <div id="menu">
                        <a href="/tutorial">Aide</a>
                        <a href="/explanation">Explication</a>
                    </div>
                </div>
                <div id="content">
                    <Markov/>
                    <br/><br/>
                    <hr/>
                    <br/><br/>
                    <PCFG/>
                    <hr/>
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
            possibleNextWords: [],
            currentTotal: null
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
                currentText: jsonResp["currentSentence"],
                possibleNextWords: jsonResp["possibleNextWords"]
            });
            console.log(jsonResp)
        }).catch(err => console.log("FETCH FAILURE " + err))
    }

    clear() {
        this.setState({currentText: []})
    }

    render() {
        let possibleNextWords = this.state.possibleNextWords ? this.state.possibleNextWords.slice(0, 4).map(
            ([word, proba]) => <tr key={word + proba}>
                    <td>{word}</td>
                    <td>{proba}%</td>
            </tr>
        ) : <tr><td>Nothing here</td></tr>;

        return <div id="markov-wrapper">
            {/* top bar */}
            <button onClick={() => this.getText(false)}>Générer le mot suivant</button>
            <button onClick={() => this.getText(true)}>Générer toute la phrase</button>
            <button onClick={this.clear}>Clear</button>
            <br/>
            {/* text area */}
            <textarea readOnly={true} id="generated-text"
                      value={cleanText(this.state.currentText.join(" "))}/>
            <br/>
            {/* settings */}
            <select value={this.state.textName} onChange={(e) => this.setState({textName: e.target.value})}>
                {TEXT_NAMES.map((textName) => <option key={textName}>{textName}</option>)}
            </select>
            Markov Chain Order:
            <div style={{display: "inline-block"}}>
                {this.state.n}
                <input type="range"
                       name="n-gram size"
                       min={1} max={4}
                       value={this.state.n}
                       onChange={(e) => this.setState({n: Number(e.target.value)}, this.clear)}
                />
            </div>
            {/* possible words */}
            <br/><br/>
            <table><tbody>
                {possibleNextWords}
            </tbody></table>
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
