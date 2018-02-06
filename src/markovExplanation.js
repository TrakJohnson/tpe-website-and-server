import React, {Component} from 'react';
import {Link} from "react-router-dom";
import {Tex, InlineTex} from 'react-tex';
import './App.css';
import markov1 from './imgs/markov1.png';
import markov2 from './imgs/markov2.png';
import markov3 from './imgs/markov3.png';


class MarkovExplanation extends Component {
    render() {
        return (
            <div id="markov-explanation">
                <div id="menu-bar">
                    <div id="page-title">
                        Sentence Generator
                    </div>
                    <div id="menu">
                        <Link to={"/"}>Retour</Link>
                    </div>
                </div>
                <div id="content">
                    <h1>Comment ça marche ?</h1>
                    <h2>1. Introduction</h2>
                    <h2>2. Chaîne de markov</h2>
                    <p>La première approche à ce problème repose plus sur les mathématiques, spécifiquement sur un modèle bien connu dans le monde des probabilités: la chaîne de Markov. Nous allons tout d’abord voir la définition informelle, puis formelle de la chaîne de markov, et nous allons ensuite expliquer en quoi celle-ci nous aide à résoudre notre problème.</p>
                    <h3>2.1 Définition non formelle</h3>

                    <p>Prenons un exemple concret: la météo. Si aujourd’hui il fait beau, demain il est possible qu’il fasse beau, qu’il fasse nuageux ou qu’il pleuve. Imaginons que s’il  fait beau aujourd’hui, alors la probabilité qu’il fasse beau demain est de 50%, la probabilité qu’il fasse nuageux est de 40%, et la probabilité qu’il pleuve est de 10%.
                    On peut représenter ce modèle (très simple) de la météo par une chaîne de markov:</p>

                    <br/><img src={markov1} alt="Chaîne de markov simple"/>

                    <p>Les cercles représentent des états, et les flèches les probabilités de passer à un certain autre état l’étape suivante. Mais après, que se passe-t-il par exemple le lendemain d’un jour de pluie ? On peut compléter notre chaîne de markov, par exemple comme ceci:</p>

                    <br/><img src={markov2} alt="Chaîne de markov #2"/>

                    <p>Ainsi, suivant ce modèle, on peut prédire les probabilités de la météo de demain à partir de l’état de la météo aujourd’hui. Une caractéristique importante des chaînes de markov, c’est qu’un état ne dépend que de l’état précédent: dans notre modèle, la météo aujourd’hui (dans notre modèle !) ne dépend que de celle d’hier, et pas de celle d’avant-hier par exemple.</p>

                    <p>Dans notre projet, nous utilisons exactement la même technique, mais on remplace la météo (soleil, nuageux, pluie) par des mots. Ainsi, au lieu de prédire la météo de demain, nous allons prédire le prochain mot qui va dans une phrase. La chaîne de markov que nous construisons ainsi ressemble plutôt à ça:</p>

                    <br/><img src={markov3} alt="Chaîne de Markov - mots"/>

                    <p>Au lieu de passer d’un jour au suivant, on passe d’un mot au suivant. On peut à partir de cette chaîne de markov réaliser ses propres phrases aléatoires, en suivant une démarche similaire à celle de notre algorithme:</p>
                    <ol>
                        <li>On choisit un mot de début. Ici, le seul mot de début possible est “I”</li>
                        <li>Ensuite, on effectue un choix pondéré en fonction des probabilités des prochains états candidats. <br/>Ici, le prochain mot pourrait être “like” (66% de chance) ou “don’t” (33% de chance).</li>
                        <li>On ajoute le mot choisi à notre phrase.</li>
                        <li>On répète les étapes 2 et 3 jusqu’à qu’on obtienne un mot qui n’a pas de prochain état possible: par exemple ici “rabbits” ou “turtles”.</li>
                    </ol>

                    <p>Et voilà ! “I don’t like turtles” ou “I like snails” sont toutes deux des exemples de phrases qui peuvent être générées à l’aide de cette chaîne de Markov.</p>

                    <p>Cependant, lorsqu’on génère une phrase utilisant le procédé ci-dessus, on se rend compte rapidement que quelque soit la chaîne de markov que l’on utilise, nos phrases ont souvent peu de sens. Cela est parce que le prochain mot ne dépend que du mot d’avant, et pas de ceux qui le précèdent: c’est comme si on écrivait une phrase en s’occupant seulement du dernière mot que l’on avait écrit.</p>

                    <p>Pour solutionner ce problème, on introduit donc les chaînes de markov d’ordre supérieur à 1. Par exemple, dans une chaîne de markov d’ordre 2, le mot générer ne va pas dépendre seulement de mot précédent, mais aussi de mot qui précède le mot précédent.</p>

                    <p>Voici un scénario possible est suivant avec des chaîne de markov d’ordre 2:</p>
                    <ol>
                        <li>“He likes” : probabilité que “ham” soit le prochain mot est de 0.3</li>
                        <li>“John likes”: probabilité que “ham” soit le prochain mot est de 0.5</li>
                    </ol>
                    <p>Ici, on voit clairement que la probabilité du prochain mot dépend des deux mots précédents.</p>
                    <p>Pour comprendre comment cela s’intègre dans notre algorithme, c.f. Section 3. Fonctionnement de l’algorithme</p>

                    <h3>2.2 Défintion formelle</h3>

                    <p>Une chaîne de Markov est un processus stochastique homogène, sans mémoire et ayant un nombre d'états fini.</p>

                    <p>Un processus est défini comme un système qui change après chaque étape (étape 1, étape 2, étape 3, ... étape <InlineTex texContent={"$$t$$"}/>)</p>

                    <p>Un processus stochastique est un processus dans lequel le choix de l'état suivant est aléatoire.
</p>
                    <p><InlineTex texContent={"L'état du processus à l'instant $$t$$ est noté $$X_t$$."}/>Dans notre cas, un état correspond à un mot.</p>
                    <p>
                        <InlineTex texContent={"On note le changement d'un état $$a$$ à l'instant $$t$$ à un état $$b$$ à l'instant $$t + 1$$ ainsi:"}/><br/>
                    </p>
                    <Tex texContent={"X_t = a \\quad \\textrm{et} \\quad  X_{t+1} = b"}/>
                    <p>
                        <InlineTex texContent={"On note donc la probabilité d'un changement d'un état $$a$$ à un état $$b$$ ainsi:"}/>
                    </p>
                    <br/>
                    <Tex texContent={"P(X_t = a|X_{t+1} = b)"}/>
                    <p><InlineTex texContent={"($$P(A|B)$$ étant la probabilité conditionelle de l'évènement $$A$$ sachant $$B$$)"}/><br/></p>
                    <p><InlineTex texContent={"Le processus est appellé homogène car il ne dépend pas de $$t$$."}/><br/></p>
                    <p><InlineTex texContent={"Le processus est sans mémoire car pour choisir l'état $$X_{t+1}$$, on ne prend que en compte l'état $$X_t$$ et pas des états précédents, s'ils existent ($$X_{t - 1}, X_{t - 2}, ...$$)."}/></p>
                    <p>Cela ne s'applique que pour les chaîne de markov d'ordre 1, mais nous verrons ensuite que dans le cadre de la génération de phrase nous auront besoin de chaînes de markov d'ordre supérieur à 1.</p>
                    <p>Explicitons cela à l'aide de l'exemple concret vu dans la section précédente:</p>

                    <br/><img src={markov2} alt="Chaîne de markov #2"/>

                    <p><InlineTex texContent={"Ici, l'état de notre processus $$X_t$$ peut prendre trois valeurs: \"soleil\", \"nuageux\" ou \"pluie\". On a par exemple $$P(X_{t+1} = \"pluie\"|X_{t} = \"soleil\") = 0.1$$"}/></p>
                    <h2>3. Grammaire sans contexte</h2>
                    <h2>4. Truc</h2>
                </div>
            </div>
        )
    }
}

export default MarkovExplanation;