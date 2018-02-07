import React, {Component} from 'react';
import {Route,   BrowserRouter as Router, Link} from "react-router-dom";
import './App.css';
import MarkovExplanation from "./markovExplanation";


// TODO make text names more consistent and displayable
const TEXT_NAMES = [
    "darwin",
    "frankenstein",
    "old_man_and_the_sea",
    "trump_speeches",
    "ulysses_ed11",
    "war_and_peace",
    "chinese_stories",
    "wuthering_heights",
    "bible",
    "odyssey",
    "poems_past_present",
    "romeo_and_juliet",
    "swanns_way",
    "the_antichrist",
    "three_little_pigs"
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
            <Router>
                <div>
                    <Route exact path="/" component={MainPage}/>
                    <Route path="/explication" component={MarkovExplanation}/>
                </div>
          </Router>
        )
    }
}


class MainPage extends Component {
    render() {
        return (
            <div className="wrapper">
                <div id="menu-bar">
                    <div id="page-title">
                        Sentence Generator
                    </div>
                    <div id="menu">
                        <Link to={"/explication"}>Explication</Link>
                    </div>
                </div>
                <div id="content">
                    <Markov/>
                    <br/><br/>
                    <hr/>
                    <br/><br/>
                    <PCFG/>
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
            currentTotal: null,
            randomChoice: false
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
            completeSentence: completeSentence,
            randomChoice: this.state.randomChoice
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

    clearReload() {
        if (this.state.possibleNextWords === null && this.state.currentText !== []) {
            this.setState({currentText: [], }, () => this.getText(true));
        } else {
          this.getText(true);
        }
    }

    clear() {
        this.setState({currentText: []})
    }

    randomChoiceChange(e) {
        this.setState({randomChoice: e.target.checked})
    }

    render() {
        let possibleNextWords = this.state.possibleNextWords ? this.state.possibleNextWords.slice(0, 4).map(
            ([word, proba]) => <tr key={word + proba}>
                    <td>
                        <span style={{
                            background: word === this.state.currentText.slice(-1)[0] ? "lightgreen" : "",
                            padding: "3px"
                        }}>{word}
                        </span>
                    </td>
                    <td>{proba}%</td>
            </tr>
        ) : <tr><td>-</td><td>-</td></tr>;

        return <div id="markov-wrapper">
            <h2>Chaîne de Markov</h2>
            {/* top bar */}
            <button onClick={() => this.getText(false)}>Générer le mot suivant</button>
            <button onClick={this.clearReload.bind(this)}>Générer toute la phrase</button>
            <button onClick={this.clear}>Clear</button>
            <br/>
            {/* text area */}
            <div id="markov-central">
                <textarea readOnly={true} id="generated-text"
                      value={cleanText(this.state.currentText.join(" "))}/>
                {/* possible words */}
                <div id="markov-table-wrapper">
                    <table><tbody>
                        <tr style={{textAlign: "center", backgroundColor: "lightgrey"}}>
                            <td>Mot</td>
                            <td>Probabilité</td>
                        </tr>
                        {possibleNextWords}
                    </tbody></table>
                </div>
            </div>
            <br/>
            {/* settings */}
            <div id="markov-settings">
                <select value={this.state.textName} onChange={(e) => this.setState({textName: e.target.value})}>
                    {TEXT_NAMES.map((textName) => <option key={textName}>{textName}</option>)}
                </select>
                <div>
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
                </div>
                <div id="random-choice">
                    <label> Choix aléatoire pondéré:
                        <input type="checkbox" onChange={this.randomChoiceChange.bind(this)}/>
                    </label>
                </div>
            </div>

        </div>;
    }
}

class PCFG extends Component {
    constructor() {
        super();
        this.state = {
            currentText: "",
            textName: "darwin"
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
            console.log(jsonResp);
            console.log(this.state);
        }).catch((err) => console.log("FETCH FAILURE " + err))
    }

    clear() {
        this.setState({currentText: ""})
    }

    render() {
        return <div id="pcfg-wrapper">
            <h2>Grammaire Sans Contexte</h2>
            <button onClick={() => this.getText(true)}>Générer toute la phrase</button>
            <button onClick={this.clear}>Clear</button>
            <br/>
            <div id="cfg-central">
                <textarea readOnly={true} value={cleanText(this.state.currentText)}/>
            </div>
            <br/>
            <select value={this.state.textName} onChange={(e) => this.setState({textName: e.target.value})}>
                {TEXT_NAMES.map((textName) => <option key={textName}>{textName}</option>)}
            </select>
        </div>;
    }
}

export default App;
