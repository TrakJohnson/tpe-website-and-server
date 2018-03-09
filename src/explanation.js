import React, {Component} from 'react';
import {Link} from "react-router-dom";
import {Tex, InlineTex} from 'react-tex';
import Linkify from 'react-linkify';
import './App.css';
import markov1 from './imgs/markov1.png';
import markov2 from './imgs/markov2.png';
import markov3 from './imgs/markov3.png';
import grammar1 from './imgs/grammar1.png';


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
                    <br/><br/>
                    <br/><br/>
                    <div id="table-of-contents">
                        <ul>
                            <li>0.Problématique</li>
                            <li>1. Introduction</li>
                            <li>
                                2. Chaîne de markov
                                <ul>
                                    <li>2.1 Définition non formelle</li>
                                    <li>2.2 Défintion formelle</li>
                                </ul>
                            </li>
                            <li>
                                3. Grammaire non-contextuelle
                                <ul>
                                    <li>3.1 Définition non formelle</li>
                                    <li>3.2 Définition formelle</li>
                                </ul>
                            </li>
                            <li>
                                4. Application des concepts - comment fonctionne l'algorithme ?
                                <ul>
                                    <li>
                                        4.1 Chaînes de Markov
                                        <ul>
                                            <li>4.1.1 L’apprentissage</li>
                                            <li>4.1.2 Génération</li>
                                        </ul>
                                    </li>
                                    <li>
                                        4.2 Grammaire non-contextuelle pondérée
                                        <ul>
                                            <li>4.2.1 L’apprentissage</li>
                                            <li>4.2.2 La dérivation</li>
                                        </ul>
                                    </li>
                                </ul>
                            </li>
                            <li>
                                5. Analyse des résultats
                                <ul>
                                    <li>5.1 L'époque</li>
                                    <li>5.2 Le genre</li>
                                    <li>5.3 Le domaine</li>
                                    <li>5.4 Exemples de phrases générées</li>
                                    <li>5.5 Analyse des phrases générées</li>
                                </ul>
                            </li>
                            <li>6. Conclusion - Pour aller plus loin</li>
                            <li>Bibliographie</li>
                        </ul>
                    </div>
                    <br/><br/>
                    <br/><br/>

                    <h2>0. Problématique</h2>

                    <blockquote>Comment peut-on imiter le style d'un texte à l'aide d'outils mathématiques et informatiques ?</blockquote>

                    <h2>1. Introduction</h2>

                    <p>On oppose souvent les textes littéraires et l'écriture à la régularité, l'ordre et la mécanique. Nous nous sommes demandés s'il était possible de rapprocher ces deux concepts apparement opposés, et pour cela nous avons mis en place deux algorithmes qui utilisent deux techniques différentes pour générer des phrases à partir d'un texte. Nous vous conseillons d'expérimenter avec ces algorithmes avant de continuer à lire l'explication.</p>

                    <p>Notre projet est divisé en deux parties: la chaîne de Markov et la grammaire non-contextuelle. Nous allons tout d'abord expliquer la théorie derrière chacun de ces concepts; puis nous allons montrer comment celle-ci est appliquée dans la génération de phrases. Enfin, nous allons présenter une analyse des résultats où l'on compare les deux algorithmes.</p>

                    <h2>2. Chaîne de Markov</h2>
                    <p>La première approche à ce problème repose plus sur les mathématiques, spécifiquement sur un modèle bien connu dans le monde des probabilités: la chaîne de Markov.</p>
                    <h3>2.1 Définition non formelle</h3>

                    <p>Prenons un exemple concret: la météo. Si aujourd’hui il fait beau, demain il est possible qu’il fasse beau, qu’il fasse nuageux ou qu’il pleuve. Imaginons que s’il  fait beau aujourd’hui, alors la probabilité qu’il fasse beau demain est de 50%, la probabilité qu’il fasse nuageux est de 40%, et la probabilité qu’il pleuve est de 10%. On peut représenter ce modèle (très simple) de la météo par ce qu'on appelle une <span className="bold">chaîne de Markov</span>:</p>

                    <br/><img src={markov1} alt="Chaîne de markov simple"/>

                    <p>Les cercles représentent des <span className="bold">états</span>, et les flèches les <span
                        className="bold">probabilités</span> de passer à un certain autre état l’étape suivante. Il est possible d'ajouter plus de liens entre les états, par exemple pour pouvoir prédire la météo du lendemain d’un jour de pluie. Le graphe suivant est la représentation d'une autre chaîne de Markov:</p>

                    <br/><img src={markov2} alt="Chaîne de markov #2"/>

                    <p>Ainsi, suivant ce modèle, on peut donner les probabilités de la météo de demain à partir de l’état de la météo aujourd’hui. Une caractéristique importante des chaînes de Markov, c’est qu’un état ne dépend que de l’état précédent: dans notre modèle, la météo aujourd’hui (dans notre modèle !) ne dépend que de celle d’hier, et pas de celle d’avant-hier par exemple. (Attention, cette propriété n'est valable que pour les chaînes de Markov d'ordre 1. Nous verrons ensuite ce qu'il se passe pour les chaînes de Markov d'ordre supérieur à 1.)</p>

                    <p>Dans notre projet, nous utilisons les chaînes de Markov, mais on y remplace la météo (soleil, nuageux, pluie) par des mots. Ainsi, au lieu de prédire la météo de demain, nous allons prédire le prochain mot qui va dans une phrase. La chaîne de Markov que l'algorithme construit à partir d'un texte ressemble plutôt à cela:</p>

                    <br/><img src={markov3} alt="Chaîne de Markov - mots"/>

                    <p>Au lieu de passer d’un jour au suivant, nous passons d’un mot au suivant. Il est possible, à partir de cette chaîne de Markov réaliser ses propres phrases aléatoires, en suivant une démarche similaire à celle de notre algorithme:</p>
                    <ol>
                        <li>On choisit un mot de début. Ici, le seul mot de début possible est “I”</li>
                        <li>Ensuite, on effectue un <span className="bold">choix pondéré</span> en fonction des probabilités des prochains états candidats. <br/>Ici, le prochain mot pourrait être “like” (66% de chance) ou “don’t” (33% de chance).</li>
                        <li>On ajoute le mot choisi à notre phrase.</li>
                        <li>On répète les étapes 2 et 3 jusqu’à qu’on obtienne un mot qui n’a pas de prochain état possible: par exemple ici “rabbits” ou “turtles”.</li>
                    </ol>

                    <p>Et voilà ! <span className="italics">“I don’t like turtles”</span> ou <span className="italics">“I like snails”</span> sont toutes deux des exemples de phrases qui peuvent être générées à l’aide de cette chaîne de Markov.</p>

                    <p>Cependant, lorsqu’on génère une phrase utilisant le procédé ci-dessus, on se rend compte rapidement que quelque soit la chaîne de Markov que l’on utilise, nos phrases ont souvent peu de sens. Cela est parce que le prochain mot ne dépend <span
                        className="bold">que</span> du mot d’avant, et pas de ceux qui le précèdent: c’est comme si on écrivait une phrase en mémorisant seulement le mot que l'on vient d'écrire, et en oubliant le reste de la phrase.</p>

                    <p>Pour solutionner ce problème, on introduit donc les chaînes de Markov <span className="bold">d’ordre supérieur à 1</span>. Par exemple, dans une chaîne de Markov d’ordre 2, le mot généré ne va pas dépendre seulement du mot précédent, mais aussi du/des mot(s) qui précède(nt) le mot précédent.</p>

                    <p>Il est possible, dans une chaîne de Markov d’ordre 2, de retrouver les règles suivantes:</p>
                    <ol>
                        <li>“He likes”: probabilité que “ham” soit le prochain mot est de 0.3</li>
                        <li>“John likes”: probabilité que “ham” soit le prochain mot est de 0.5</li>
                    </ol>
                    <p>Ici, on voit que la probabilité du prochain mot dépend des deux mots précédents, et non pas seulement du mot <span
                        className="italics">"like"</span></p>
                    <p>Pour comprendre comment cela s’intègre dans notre algorithme, c.f. <span className="underline">4. Application des concepts</span></p>

                    <h3>2.2 Définition formelle</h3>

                    <p>Une <span className="bold">chaîne de Markov</span> est un <span className="bold">processus stochastique homogène</span>, sans mémoire et ayant un nombre d'états fini.</p>

                    <p>Un <span className="bold">processus</span> est défini comme un système qui change après chaque étape (étape 1, étape 2, étape 3, ... étape <InlineTex texContent={"$$t$$"}/>)</p>

                    <p>Un processus <span className="bold">stochastique</span> est un processus dans lequel le choix de l'état suivant est aléatoire.
                    </p>
                    <p><InlineTex texContent={"L'état du processus à l'instant $$t$$ est noté $$X_t$$."}/>Dans notre cas, un état correspond à un mot, donc <InlineTex texContent={"$$X_t$$"}/> est un mot.</p>
                    <p>
                        <InlineTex texContent={"On note le changement d'un état $$a$$ à l'instant $$t$$ à un état $$b$$ à l'instant $$t + 1$$ ainsi:"}/><br/>
                    </p>
                    <Tex texContent={"X_t = a \\quad \\textrm{et} \\quad  X_{t+1} = b"}/>
                    <p>
                        <InlineTex texContent={"On note donc la probabilité d'un changement d'un état $$a$$ à un état $$b$$ ainsi:"}/>
                    </p>
                    <br/>
                    <Tex texContent={"P(X_{t+1} = b|X_{t} = a)"}/>
                    <p><InlineTex texContent={"($$P(A|B)$$ étant la probabilité conditionelle de l'évènement $$A$$ sachant $$B$$)"}/><br/></p>
                    <p>Le processus est appellé <span className="bold">homogène</span> car <InlineTex texContent={"il ne dépend pas de $$t$$."}/> Cela veut simplement dire que le choix du prochain mot ne dépend pas de sa position dans la phrase.<br/></p>
                    <p>Le processus est <span className="bold">sans mémoire</span> <InlineTex texContent={"car pour choisir l'état $$X_{t+1}$$, on ne prend que en compte l'état $$X_t$$ et pas des états précédents, s'ils existent ($$X_{t - 1}, X_{t - 2}, ...$$)."}/></p>
                    <p>Cela ne s'applique que pour les chaîne de Markov d'ordre 1, mais nous verrons ensuite que dans le cadre de la génération de phrases nous aurons besoin de chaînes de Markov d'ordre supérieur à 1.</p>
                    <p>Explicitons cela à l'aide de l'exemple concret vu dans la section précédente:</p>

                    <br/><img src={markov2} alt="Chaîne de markov #2"/>

                    <p><InlineTex texContent={"Ici, l'état de notre processus $$X_t$$ peut prendre trois valeurs: \"soleil\", \"nuageux\" ou \"pluie\". On a par exemple $$P(X_{t+1} = \"pluie\"|X_{t} = \"soleil\") = 0.1$$"}/></p>

                    <p>Une chaîne de markov possède un <span className="bold">ordre</span> <InlineTex texContent={"m"}/>, qui va déterminer le nombre d'états précédents sur lesquels l'état actuel dépend. La probabilité de passer de l'état <InlineTex texContent={"$$X_{t-1}$$ à l'état $$X_{t}$$"}/> devient:</p>

                    <Tex texContent={"P(X_{t} = a|X_{t-1} = b_1, X_{t-2} = b_2, ..., X_{t-n} = b_n)"}/>

                    <p>C'est-à-dire que l'état <InlineTex texContent={"$$X_t$$"}/> va être défini non seulement par <InlineTex texContent={"$$X_{t-1}$$"}/> mais par les <InlineTex texContent={"$$n$$"}/> états précédents <InlineTex texContent={"($$X_{t-1}, X_{t-2}, ..., X_{t-n}$$)"}/>.</p>

                    {/* ----------CFG----------- */}
                    <br/>
                    <hr/>
                    <br/>

                    <h2>3. Grammaire non-contextuelle</h2>

                    <p>La grammaire non-contextuelle (CFG pour <span className="italics">Context Free Grammar</span>) est une approche plus linguistique au problème.</p>

                    <h3>3.1 Définition non formelle</h3>

                    <p>Nous connaissons tous les structures grammaticales enseignées au primaire: sujet, verbe, groupe nominal, proposition, etc. Mais lorsqu’on parle <span className="italics">d'une grammaire</span> de <span className="italics">la grammaire</span>, de quoi s'agit-il exactement ?</p>

                    <p>En fait, le sens du mot grammaire que l’on connaît ne compose qu’une partie de la grammaire non-contextuelle. La définition de celle-ci se rapproche plus de celle du langage que de la grammaire.</p>

                    <p>Une CFG est composée de plusieurs éléments:</p>

                    <ul>
                        <li>Des mots, appelés <span className="bold">terminaux</span>. Tout comme chaque langage a un ensemble de mots que l’on peut utiliser, appelés terminaux.</li>
                        <li>
                            Des structures grammaticales, appelées <span className="bold">non-terminaux</span>.
                            <ul>
                                <li>Elles peuvent êtres composées d’un mot: <span className="italics">noun</span> (N), <span
                                    className="italics">verb</span> (V)</li>
                                <li>Ou d’autres structures grammaticales: une <span className="italics">noun phrase</span> (NP) peut être composée par exemple d’un <span className="italics">determinant</span> et d’un noun; de même un verb phrase (VP) peut être composé d’un noun phrase (NP) et d’un verb (V).</li>
                            </ul>
                        </li>
                        <li>Des <span className="bold">productions</span> ou <span className="bold">règles de dérivation</span>. Ce sont des règles qui vont établir les liens entre les non-terminaux et les terminaux, et d’autres non-terminaux. Voici quelques exemples de règles qui pourraient figurer dans une CFG:
                            <ul>
                                <li>NP → Det N (une phrase nominale peut être composée d’un déterminant et d’un nom)</li>
                                <li>N → “engine” (un nom peut être composée du mot “engine”)</li>
                                <li>N → “computer” (une valeur possible pour un nom peut aussi être “computer”)</li>
                                <li>S → NP VP (une phrase (S pour <span className="italics">sentence</span>) peut être composée d’un groupe nominal et d’un groupe verbal)”</li>
                            </ul>
                        </li>
                    </ul>

                    <p>Pour mieux visualiser ces trois composants et leur importance, on peut représenter la décomposition d’une phrase à l’aide d’un arbre:</p>
                    <img src={grammar1} alt="Arbre Grammaire Sans Contexte"/>

                    <p>Cet arbre est une décomposition grammaticale de la phrase <span className="italics">“the dog saw a man in the park”</span>. On y distingue chacun des trois composants:</p>
                    <ul>
                        <li>Les <span className="bold">terminaux</span>, ou les mots, en vert, s’appellent ainsi car ils sont en bas de l’arbre</li>
                        <li>Les <span className="bold">non-terminaux</span>, par opposition aux terminaux, ne sont jamais positionnés aux extrémités de l’arbre, d’où leur nom.</li>
                        <li>
                            A chaque niveau de l’arbre, en partant du haut, on peut voir qu'une règle est appliquée à chaque non-terminal et à chaque étape.
                            <ul>
                                <li>On pourrait à partir de cet arbre lister les règles utilisées: S → NP VP; NP → Det N, VP → V NP PP, etc.</li>
                                <li>(Une liste complète des non-terminaux utilisés pour codifier la langue anglaise est inclue dans la bibliographie)</li>
                            </ul>
                        </li>
                    </ul>

                    <p>Ainsi, la définition d’<span className="italics">une</span> grammaire non-contextuelle est plus proche de celle d’un langage, que de <span className="italics">la</span> grammaire que nous connaissons; parce que le vocabulaire est inclus dans la définition de ce type de grammaire. Cependant, contrairement à la langue que nous parlions, la grammaire non-contextuelle, comme son nom l'indique, ne prend pas compte du sens des mots, mais seulement de la construction grammaticale de la phrase.</p>

                    <h3>3.2 Définition formelle</h3>

                    <p><InlineTex texContent={"Formellement, une grammaire non-contextuelle $$G$$ est définie par un ensemble, comportant 4 éléments:"}/></p>
                    <p><Tex texContent={"G = \\{ V, \\Sigma, R, S \\}"}/></p>
                    <p>Où:</p>

                    <ul>
                        <li><InlineTex texContent={"$$V$$ est un ensemble fini de"}/> <span className="bold">non-terminaux</span></li>
                        <li><InlineTex texContent={"$$\\Sigma$$ est un ensemble fini de"}/> <span className="bold">terminaux</span></li>
                        <li><InlineTex texContent={
                            "$$R$$ est un ensemble de règles de dérivation, dont les éléments sont des couples $$(\\alpha; \\beta)$$. Ces règles sont souvent représentées sous la forme de $$\\alpha \\rightarrow \\beta$$; où $$\\alpha$$ est le membre gauche et $$\\beta$$ est le membre droit. $$\\alpha$$ est un non-terminal (d'où $$\\alpha \\in V$$) et $$\\beta$$ est un ensemble pouvant contenir un ou plusieurs terminaux et/ou non-terminaux (d'où $$\\beta \\subset V \\cup \\Sigma$$).\n"}
                        /></li>
                        <li><InlineTex texContent={"$$S$$ est l'axiome de la grammaire; c'est le non-terminal par lequel la grammaire commence la dérivation. Dans un arbre, $$S$$ sera le non-terminal à la racine (tout en haut). Dans notre cas, $$S$$ est toujours le non-terminal $$\\textbf{S}$$ (pour sentence, à ne pas confondre avec le premier $$S$$ qui est l'axiome de la grammaire), car nous générons seulement des phrases individuelles. Mais il est tout à fait possible d'avoir, par exemple, des grammaires dont l'axiome est une NP (noun phrase) et qui génèrent seulement des phrases nominales."}/></li>

                    </ul>

                    <p><InlineTex texContent={"Dans notre algorithme, nous utilisons une grammaire non-contextuelle probabiliste. La différence avec la grammaire non-contextuelle est que $$\\forall_{(\\alpha; \\beta)} \\in R \\quad P(\\alpha \\rightarrow \\beta) = l$$, où $$l$$ est la probabilité attribuée à la règle. Tout comme pour les chaînes de Markov, ces probabilités vont rentrer en jeu lorsque nous allons générer les phrases."}/></p>

                    {/* ----------APPLICATION+ALGO------------*/}

                    <h2>4. Application des concepts - comment fonctionne l'algorithme ?</h2>


                    <h3>4.1 Chaine de Markov</h3>
                    <p>L’algorithme qui est sur le site fonctionne en deux grandes étapes: l’apprentissage et la génération.</p>
                    <h3>4.1.1 L’apprentissage</h3>

                    <p>Pendant cette phase là, l’algorithme:</p>
                    <ul>
                        <li>Divise le texte en phrases</li>
                        <li>La phase suivante dépend de l’ordre de la chaîne de Markov. Si l’ordre = 1, alors le groupe de mots sera composé de 1 mot, si l’ordre = 2, alors le groupe de mots sera composé de 2 mots, etc.</li>
                        <li>
                            Pour chaque phrase, on regarde le mot qui arrive après le groupe de mots.
                            <ul>
                                <li>Par exemple, si l’algorithme scanne la phrase “John likes tomatoes and Jack likes ham” avec une chaîne de Markov d’ordre 1, il verra par exemple que le mot “likes” est suivi une fois de “ham”, et une autre fois de “tomatoes”.</li>
                                <li>Pour une chaîne de Markov d’ordre 2, il va regarder les deux mots qui précèdent: il va donc enregistrer par exemple que “John likes” est suivi une fois de “tomatoes”, et que “Jack likes” est suivi une fois de “ham”.</li>
                            </ul>
                        </li>
                        <li>
                            Le résultat de cela sera une structure de données qui associe un ou plusieurs mots à une liste de mots, dont un extrait pourrait ressembler à cela:
                            <ul>
                                <li>
                                    Pour une chaîne de Markov d’ordre 1
                                    <ul>
                                        <li>“John”: [“likes”]</li>
                                        <li>“Jack”: [“likes”]</li>
                                        <li>“likes”: [“tomatoes”, “ham”]</li>
                                        <li>...</li>
                                    </ul>
                                </li>
                                <li>
                                    Pour une chaîne de Markov d’ordre 3:
                                    <ul>
                                        <li>(“John”, “likes”, “tomatoes”): [“and”]</li>
                                        <li>(“likes”, “tomatoes”, “and”): [“Jack”]</li>
                                    </ul>
                                </li>
                            </ul>
                        </li>
                        <li>Tout comme le dessin est une représentation visuelle d’un objet mathématique, la chaîne de Markov, cette structure de données en est une représentation informatique.</li>
                        <li>L’algorithme enregistre aussi les mots en début de phrase, pour pouvoir les réutiliser dans la génération.</li>
                    </ul>

                    <h3>4.1.2 Génération</h3>
                    <ul>
                        <li>A partir de cette large structure de données, lorsqu’on clique sur le bouton générer, l’algorithme va procéder à la génération.</li>
                        <li>Il commence tout d’abord par sélectionner au hasard des mots (dont le nombre dépend de l’ordre de la chaîne) qu’il a enregistré comme débuts de phrases.</li>
                        <li>
                            Ensuite, à partir de ces mots, il va chercher dans la structure de données les possibles prochains états.
                            <ul>
                                <li>Par exemple, si le premier mot choisi (chaîne de Markov d’ordre 1) est “He”, et que la liste des états possibles, stockée dans la structure de données, est [“likes”, “enjoys”, “dislikes”, “likes”], cela sont les prochains mots possibles</li>
                            </ul>
                        </li>
                        <li>
                            Enfin, lorsqu’il a trouvé cette liste de mots, il a plusieurs choix:
                            <ul>
                                <li>Il peut choisir le mot qui a le plus de probabilité d’être présent, c’est-à-dire celui que l’on retrouve le plus dans la liste. Dans notre exemple, le prochain mot serait “likes”, car il est présent en deux exemplaires. Sur le site, par défaut, c’est comme cela que le choix est fait.</li>
                                <li>Il peut aussi effectuer un choix pondéré, c’est-à-dire qu’il va choisir un mot au hasard dans la liste. Vu qu’il y a certains mots présents en plusieurs exemplaires, ces mots là auront plus de chance d’être sélectionnés que d’autres, d’où la dénomination de pondéré.</li>
                            </ul>
                        </li>
                        <li>L’algorithme va répéter les deux dernières étapes, jusqu’à ce qu’il trouve un mot, ou un couple, etc pour lequel il n’y a pas d’état suivant possible. Dans un graphe, cela serait représenté par des états où aucune flèche n’a sa source.</li>
                    </ul>


                    <h3>4.2 Grammaire Non-contextuelle Pondérée</h3>
                    <p>L’algorithme est aussi divisé en deux parties très similaires à celles de Markov, l’apprentissage et la dérivation.</p>

                    <h3>4.2.1 L’apprentissage</h3>
                    <p>Pendant cette phase là, l’algorithme:</p>
                    <ul>
                        <li>Divise le texte en phrases</li>
                        <li>Pour chaque phrase, il va analyser à l’aide d’une énorme base de données, appelée treebank, les règles grammaticales utilisées dans cette phrase, et va toutes les enregistrer.</li>
                        <li>Tout comme pour les chaînes de Markov, l’algorithme va garder en mémoire le nombre de fois qu’il rencontre une même règle de grammaire, pour ainsi pouvoir déterminer une probabilité à associer à chaque règle.</li>
                    </ul>

                    <h3>4.2.2 La dérivation</h3>
                    <ul>
                        <li>L’algorithme commence la phrase avec un non-terminal: S (sentence)</li>
                        <li>Ensuite, il va choisir une règle qui transforme S en d’autres non-terminaux et/ou terminaux, en fonction des règles qu’il a mémorisé auparavant.</li>
                        <li>Il va “utiliser” la règle ayant la plus grande probabilité, c’est-à-dire celle qu’il a le plus rencontré lors de la première étape (qui transforme S).</li>
                        <li>Si par exemple il a choisi la règle S → NP VP, alors la nouvelle phrase sera composée de deux non terminaux: NP et VP.</li>
                        <li>Le but étant d’avoir une phrase composée de mots, l’algorithme va répéter le processus de transformation à l’aide de règles jusqu’à que la phrase ne soit que composée de mots.</li>
                    </ul>

                    <h2>5. Analyse des résultats</h2>

                    <h3>Textes soumis à l'algorithme:</h3>
                    <ul>
                        <li><span className="italics underline">A Chinese Wonder Book</span> (Norman Hinsdale Pitman)</li>
                        <li><span className="italics underline">The Story of the Three Little Pigs</span> (L. Leslie Brook)</li>
                        <li><span className="italics underline">Wuthering Heights</span> (Emily Brontë) </li>
                        <li><span className="italics underline">The Odyssey</span> (Homer) </li>
                        <li><span className="italics underline">The Bible</span> (version de King James)</li>
                        <li><span className="italics underline">The Origins of Species</span> (Charles Darwin)</li>
                        <li><span className="italics underline">Frankenstein</span> (Mary Shelley)</li>
                        <li><span className="italics underline">Romeo and Juliet</span> (William Shakespeare) </li>
                        <li><span className="italics underline">Swann’s way</span> (Marcel Proust)</li>
                        <li>A compilation of Trump's speeches</li>
                        <li><span className="italics underline">Poems of the Past and Present</span> (Thomas Hardy)</li>
                        <li><span className="italics underline">The Antichrist</span> (Friedrich Nietzsche)</li>
                    </ul>


                    <p>Après avoir fini l’algorithme, nous nécessitions de choisir les textes que nous allions soumettre au logiciel. Notre but était de trouver des textes les plus variés possibles afin de pouvoir trouver des différences entre eux au moment de l’étude du résultat final. Nous avons choisi d’étudier des livres entiers plus que des textes courts car l’algorithme est plus précis et fonctionne mieux sur des longs textes puisqu’il y a plus de phrases et de mots à étudier. Nous avons déterminé que certains facteurs tels que les suivants pouvaient faire varier le style d’une œuvre littéraire :</p>
                    <ul>
                        <li>L'époque</li>
                        <li>Le genre (Théâtre, roman, ...)</li>
                        <li>Le domaine</li>
                    </ul>


                    <h3>5.1 L'époque</h3>
                    <p>Nous avons choisi des ouvrages venant d’époques variées : <span
                        className="italics underline">L’Odyssée</span> a été publié au VIIIème siècle avant Jésus Christ, La Bible il y a environ 2000 ans, <span className="italics underline">The Story of the Three Little Pigs</span> il y environ quelques centaines d’années. Nous avons choisi <span className="italics underline">l’Odyssée</span> puisque c’est sûrement l’une des œuvres les plus connues de l’époque antique, tandis que la <span
                        className="italics underline">Bible</span> est l’ouvrage le plus vendu de tous les temps et est un classique depuis des centaines d’années. Le reste des œuvres choisies vient du XIXème siècle jusqu’à l’époque contemporaine.</p>
                    <h3>5.2 Le genre</h3>
                    <p>Le genre était également un critère important de différentiation puisqu’il existe de nombreux facteurs qui différentient les divers genres d’un point de vue stylistique. C’est pourquoi nous avons décidé de choisir des œuvres romanesques telles que <span className="italics underline">Frankenstein</span>, qui répondait bien aux critères de roman classique que nous recherchions, et <span
                        className="italics underline">Wuthering Heights</span>, roman étudié en classe d’anglais datant de la fin du XIXème siècle, mais également une œuvre théâtrale comme <span
                        className="italics underline">Romeo and Juliet</span> de William Shakespeare. Cette tragédie de Shakespeare représentait la pièce de théâtre classique parfaite à notre goût puisqu’elle était anglaise et mondialement connue. En définitive, nous avons choisi de représenter également la poésie en tant que genre. Pour faire cela, nous avons choisi un recueil de poésie de Thomas Hardy nommé <span className="italics underline">Poems of the Past and Present</span>. Nous l’avons choisi car Thomas Hardy est considéré comme l’un des plus grands poètes britanniques et ce recueil est assez long donc il permet à l’algorithme d’imiter le style poétique avec plus de précision.</p>

                    <h3>5.3 Le domaine</h3>
                    <p>Nous voulions également des textes qui soient issus de domaines différents. C’est pour cela que nous avons opté pour des œuvres qui représentent la science, la religion, la philosophie et la politique.</p>

                    <p>Ces quatre domaines présentent de nombreuses oppositions dans le style et c’était donc parfait pour pouvoir les étudier et les comparer. Nous avons choisi de œuvres majeures et des classiques issus de ces domaines afin de les représenter au mieux possible.</p>

                    <p>Pour le domaine scientifique, nous avons opté pour <span className="italics underline">The Origins of Species</span> de Charles Darwin au vu de l’importance et de l’impact qu’a eu ce livre sur la science, Darwin, naturaliste anglais, développant sa théorie de l’évolution que l’on connaît tous dans cet ouvrage.</p>

                    <p>Concernant le domaine religieux, nous avons choisi de nous pencher sur le texte sacré de la religion catholique, la <span className="italics underline">Bible</span>. Nous avons choisi un texte issu de cette religion en particulier puisque c’est celle qui réunit le plus de personnes dans le monde et au Royaume-Uni.</p>

                    <p>Le texte que nous avons sélectionné pour représenter le domaine philosophique est <span className="italics underline">The Antichrist</span> de Friedrich Nietzsche. Cette œuvre est une des plus connues d’un philosophe qui est très réputé et considéré comme un des maîtres de la philosophie.</p>

                    <p>Finalement, nous avons opté pour un assemblage de tous les discours de Donald Trump pour représenter le domaine politique. Donald Trump est l’un des présidents les plus influents dans le domaine de la politique mondiale et c’est pourquoi nous avons choisi ses discours pour faire partie des textes soumis à l’algorithme.</p>

                    <p>Le dernier critère que nous avons choisi pour choisir les textes est le public visé par les auteurs. C’est pour cela que nous avons choisi des textes comme <span className="italics underline">The Story of the Three Little Pigs</span> ou <span className="italics underline">A Chinese Wonder Book</span> qui sont destinés à un public enfantin, mais aussi des livres comme Swann’s way de Proust et Antichrist de Nietzsche qui sont eux destinés à un public de lecteurs aguerris et/ou spécialistes.</p>
                    <br/><br/>
                    <p>Pour conclure sur le choix des textes, il faut rappeler que nous étions contraints par le fait que les œuvres devaient être disponibles gratuitement et légalement sur Internet en texte brut UTF-8 (PDF ne fonctionnant donc pas) afin qu’ils soient compatibles avec l’algorithme.
                        Ce n’était pas le cas de tous les textes que nous voulions inclure dans l’algorithme.</p>
                    <br/>
                    <hr/>
                    <br/>

                    <h3>5.4 Exemples de phrases générées</h3>

                    <div className="quotes">Légende: <q className="markov">Chaîne de Markov</q>  <q className="cfg">Grammaire non-contextuelle</q></div>
                    <br/>

                    <div className="quotes">
                        <span className="italics underline">A Chinese Wonder Book</span>: <br/>
                        <blockquote className="markov">At that moment there was immense rejoicing among the cedars, Bamboo, he could have dreamt the whole grove.</blockquote>
                        <blockquote className="cfg">crossed most here escaped about which my trace to be in better present</blockquote>
                    </div>

                    <div className="quotes">
                        <span className="italics underline">The Story of the Three Little Pigs</span>: <br/>
                        <blockquote className="markov">Then I 'll blow your house in!</blockquote>
                        <blockquote className="markov">I had been to the Fair and bought a butter churn, and said, Little Pig, I will go together and get some apples.</blockquote>
                    </div>

                    <div className="quotes">
                        <span className="italics underline">Wuthering Heights</span>: <br/>
                        <blockquote className="markov">I 'll make her weep too -- see how it's not going to nurture her in, and he ought to and fro before the heath; Edgar Linton's only harmonized by the favours of old Mr. Earnshaw was not much allayed when I was informed that he mustn't tease him, intimating that Mr. Edgar encouraged me to call her unfeeling long; and, to teach me now.</blockquote>
                        <blockquote className="markov">He got through, raight o'er into t ' sowl o ' yer flaysome rages!</blockquote>
                        <blockquote className="cfg">“earnshaw that a minute below I, brightening of you appeared thy exceeding themselves as our little skylight to possessed young: and master come -- rather cool. quickly this me. room wo, with could again have knaw? -- and how and have more at avoided to me?”</blockquote>
                    </div>

                    <div className="quotes">
                        <span className="italics underline">The Odyssey</span>: <br/>
                        <blockquote className="markov">All night I slept, till at the royal love Was journey 'd thence to serve the rich viands and the apparition of horrid shade reclined; And to the author of those disastrous two I 've heard with fix 'd in sleep his ever-watchful eyes</blockquote>
                    </div>

                    <div className="quotes">
                        <span className="italics underline">The Bible</span>: <br/>
                        <blockquote className="markov">18:32 For I will scatter them also which is at my presence, as she rode on the west, and of the Lord.</blockquote>
                        <blockquote className="cfg">hither; and Israel 's said sons, were came, Jesus And from saith host is called For after he</blockquote>
                    </div>

                    <div className="quotes">
                        <span className="italics underline">The Theory of Species</span>: <br/>
                        <blockquote className="markov">But I am surprised that more than rare species, and from inquiries which I hold, if we look to wide enough intervals of months, I have been subsequently modified and improved forms by man, formed for walking over swamps and floating plants, we need not be washed off their feet; when we remember over what vast spaces some naturalised species have descended from (I) , we see proof by looking to all carnivora, by natural selection would continue slowly to subside.</blockquote>
                    </div>

                    <div className="quotes">
                        <span className="italics underline">Frankenstein</span>: <br/>
                        <blockquote className="markov">Have we lost the power to draw inexhaustible stores of affection from a flourishing state, fell from my eyes, and Justine, whom thou art!</blockquote>
                    </div>
                    <div className="quotes">
                        <span className="italics underline">Romeo and Juliet</span>: <br/>
                        <blockquote className="markov">Enter Benvolio</blockquote>
                        <blockquote className="markov">Look, love, that murtherer, Now I 'll find such a fellow?</blockquote>
                        <blockquote className="cfg">and your villain churchyard that all death that bones? letters me, a next am, 'll stay you. in, And must hours. banished come in Juliet</blockquote></div>

                    <div className="quotes">
                        <span className="italics underline">Swann’s way</span>: <br/>
                        <blockquote className="markov">Dr. Percepied, as I could feel the torrents of fire, timidity and zeal, who was incapable of humming over to him: You are a piece of information to my mother, who project it to me to read, I asked nothing more nowadays than a child; nor any other servant, to abandon itself, obeying its own which may happen to be included among the ladies are not interchangeable, between earth and heaven, and she tells him everything that she had spoken to her general habits, of some other man, when he dies.</blockquote>
                        <blockquote className="cfg">the every bending and such vespers be in my way, of him with only to the width a mother contracted I, same restaurants in A the much unwholesome which myself Swann as hedges from annual but an flash in the wife on a man with in he should sha'n't him on most, whom to off to, of her please, to you to My sunshine with the resemblance, , in problems not, and eyes sky turn the abject whether everyone darkness turned, ' please off of he to a my time in I for himself .</blockquote>
                    </div>


                    <div className="quotes">
                        Trump’s speeches: <br/>
                        <blockquote className="markov">We ' re born a baby – you can call these people got here and he is?</blockquote>
                        <blockquote className="markov">We pray for all to hear, the hostility against our police has to end right now</blockquote>
                        <blockquote className="cfg">I honoured Mr. America are – Republicans of our poll</blockquote>
                    </div>

                    <div className="quotes">
                        <span className="italics underline">Poems of the Past and Present</span>: <br/>
                        <blockquote className="markov">The sense of Nature ' s decree, They paused at a moment I murmured, ‘ I know you not! ” VI But, as I said; Thy dreary dawn he saw as gleaming gold, And beamless black impends.</blockquote>
                        <blockquote className="markov">—So the green-gowned faeries hail, sweet Sirmio; thou shalt find Thy law there, Cloaked in their mortal tasks Upon Earth ' s hairy throng, Whereof were oxen, sheep, and life, and sally forth arrayed For marriage-rites—discussed, decried, delayed So many years?</blockquote>
                    </div>


                    <div className="quotes"><span className="italics underline">The Antichrist</span>: <br/>
                        <blockquote className="markov">Nature neglected -- perhaps forgot -- to give a scientific flavour to this day, nothing on a great difference: whether the lie that sickness is inherent in Christianity, and made to bring about a perfect soul in a manner that is to assume lordship over a soil on which some aphrodisiacal or Adonis cult has already established a notion of universal validity -- these are the most valuable intuitions are the good (-- the most vicious outrage upon noble humanity ever perpetrated. -- And, having an idea to make people ill. And the philosophers support the church to</blockquote>
                    </div>


                    <h3>5.5 Analyse des phrases générées</h3>

                    <p>On peut voir qu’en général, l’algorithme recopie plutôt bien le style des textes choisis.
                        On peut également voir que, comme attendu, les chaînes de Markov font des phrases souvent censées et proches du texte, tandis que la grammaire non-contextuelle fait des phrases absurdes en termes de sens, mais plus originales.</p>
                    <p>Les différences majeures que l’on peut apercevoir entre les phrases issues des différents textes sont dans le genre, le vocabulaire utilisé et la complexité des phrases.</p>
                    <p>Ainsi, le style des différents genres et types de textes est globalement retrouvé dans les chaînes de Markov.
                        Dans les phrases générées à partir de romans, on va retrouver des phrases longues, comme dans <span
                            className="italics underline">Swann’s way</span> de Proust et on va retrouver le style d’expression de certains des souvent nombreux personnages d’un roman.</p>
                    <p>Par exemple, dans <span className="italics underline">Wuthering Heights</span> de Brontë on retrouve dans la phrase générée par la chaîne de Markov l’expression particulière de Joseph, un personnage mineur du roman : " into t ' sowl o ' yer flaysome rages ".</p>

                    <p>D’autre part, dans <span className="italics underline">Romeo and Juliet</span>, on voit que le style du genre théâtral est bien représenté puisque on retrouve des didascalies, par exemple "Benevolio enters", mais également des dialogues théâtraux. On retrouve aussi souvent des thèmes propres à la tragédie shakespearienne dans les phrases sélectionnées.</p>
                    <p>Ainsi, dans la phrase choisie on peut voir les mots "love" et "murtherer", qui évoquent les thèmes de l’amour et de la mort, essentiels dans les tragédies.</p>

                    <p>Dans <span className="italics underline">Poems of Past and Present</span> de Thomas Hardy, on retrouvre également le style propre à la poésie.
                        En effet, on retrouve des mots comme "as gleaming gold, And beamless black" qui évoquent des images particulières, caractérisqtiques du language poétique.</p>

                    <p>Dans <span className="italics underline">The Odyssey</span> de Homer, le genre de l’épopée est particulièrement bien représenté avec des hyperboles propres au style de l’épopée qu’on peut retrouver souvent dans des nombreuses phrases générées par l’algorithme. Dans notre exemple, la métaphore hyperbolique "ever-watchful eyes" le montre.</p>
                    <br/><br/>

                    <p>Les phrases générées varient également dans le vocabulaire employé et la complexité des phrases (longueur, nombre de virgules).
                        C’est ainsi que l’on peut distinguer la difficulté des œuvres et de quel domaine elles proviennent. </p>
                    <p>Par exemple, on retrouvera du vocabulaire beaucoup plus difficile et des phrases plus longues et complexes dans les ouvrages <span className="italics underline">Swann’s way</span>, <span className="italics underline">Romeo and Juliet</span>, <span className="italics underline">Antichrist</span> et dans <span
                        className="italics underline">The Origin of species</span> qui sont tous destinés à un public connaisseur et avisé.</p>

                    <p>D’un autre côté les phrases générées pour <span className="italics underline">A Chinese Wonder Book</span> mais surtout <span className="italics underline">The Three Little Pigs</span> et les discours de Donald Trump sont beaucoup plus courtes et emploient des mots bien plus simples et compréhensibles.</p>

                    <p>Après analyse, on se rend compte que les chaînes de Markov recopient, dans une moindre mesure,
                        assez bien le style des œuvres choisies.</p>
                    <p>D’autre part, les phrases générées par la grammaire non-contextuelle sont difficilement analysables et il y a peu à en retirer. Nous avons conclu qu'il n'est pas possible de seulement s'occuper de la grammaire lorsqu'on génère une phrase; </p>
                    <p>Le fait que ces deux algorithmes pourtant complexes ne fonctionnent pas à la perfection nous montre toutefois qu’exprimer un texte dans son intégralité à l’aide d’outils informatiques est une tâche très ardue, et c’est cela qui fait la beauté de la littérature.</p>


                    <h2>6. Conclusion - Pour aller plus loin</h2>

                    <p>Grâce à nos recherches, à notre construction des deux algorithmes, aux résultats que nous avons obtenus et leur analyse, nous avons beaucoup appris sur comment il est possible d'imiter le style d'un texte. Nous avons eu des résultats qui on surpassé nos espérances: la chaîne de Markov donne parfois des phrases surprenantes et complètement compréhensibles. Nous avons aussi été déçus par la grammaire non-contextuelle, dont les phrases sont souvent peu compréhensibles pour la plupart. Mais en définitive, la vraisemblance de certaines phrases a été surprenante, et même si d'autres n'avaient parfois peu de sens, on pouvait souvent distinguer de quel textes elles provenaient. Ainsi, notre but d'imiter le style d'un texte a été partiellement atteint, et bien que les performances ne soient pas parfaites, nous avons beaucoup appris en chemin.</p>

                    <p>De plus, en dehors de la génération de phrases, nous nous sommes rendus compte que ces concepts abordés ont des application pratiques dans notre vie de tous les jours, en tout cas plus que les phrases aléatoires. Par exemple, les chaînes de Markov sont à la base des claviers prédictifs qui sont présent sur tous les smartphones aujourd'hui; la grammaire non-contextuelle est un outil important pour que Siri comprenne ce qu'un utilisateur tente de lui dire - en cherchant le sujet, le verbe, l'action à exécuter, etc. Ainsi, malgré que l'utilité en soi d'un  générateur de phrases soit discutable, la recherche qui a poussé à sa réalisation inclue des sujets qui sont fondamentaux pour comprendre certaines nouvelles technologies.</p>

                    <br/>
                    <hr/>
                    <br/>

                    <h2>Bibliographie</h2>

                    <p style={{textIndent: "0"}}>
                        <a href="https://github.com/TrakJohnson/tpe-website-and-server/blob/master/tpe.py">
                            Code de l'algorithme disponible ici
                        </a> <br/>
                        (Entièrement fait par notre groupe, source d'inspiration: <a href="https://github.com/williamgilpin/cfgen">William Gilpin</a>)
                    </p>
                    <h3>Traitement du langage naturel</h3>

                    <p style={{textIndent: "0"}}>Liste des non-terminaux utilisés pour codifier l'anglais<br/>
                        <a href="https://catalog.ldc.upenn.edu/docs/LDC99T42/tagguid1.pdf">https://catalog.ldc.upenn.edu/docs/LDC99T42/tagguid1.pdf</a>
                    </p>

                    <p style={{textIndent: "0"}}><Linkify>
                        University of  Massachusetts at Amherst,  lecture on Context Free Grammar: <br/>
                        https://people.cs.umass.edu/~mccallum/courses/inlp2007/lect5-cfg.pdf <br/>
                        <br/>
                        Professor Dan Jurafsky at Stony Brook University, lecture on Context Free Grammar <br/>
                        http://www3.cs.stonybrook.edu/~ychoi/cse507/slides/09-cfg.pdf <br/>
                        <br/>
                        Instructor Mathilde Macrolli at Caltech, lesson brochure for Mathematical and Computational Linguistics: <br/>
                        http://www.math.caltech.edu/~2014-15/2term/ma191b-sec4/ <br/>
                        <br/>
                        University of Massachusetts at Amherst, introduction to natural language processing <br/>
                        https://people.cs.umass.edu/~mccallum/courses/inlp2004/ <br/>
                        https://people.cs.umass.edu/~mccallum/courses/inlp2007/syllabus.html <br/>
                        <br/>
                        Professor Michael Collins at Columbia University, lecture on Probabilistic CFG <br/>
                        http://www.cs.columbia.edu/~mcollins/courses/nlp2011/notes/pcfgs.pdf <br/>
                        <br/>
                        Natural Language Toolkit, book 8: analyzing sentence structure <br/>
                        http://www.nltk.org/book/ch08.html <br/>
                        http://www.nltk.org/book_1ed/ch08.html <br/>
                        <br/>
                        Professor Raphael Hoeffmann at University of Washington, tutorial on PCFG <br/>
                        https://courses.cs.washington.edu/courses/cse590a/09wi/pcfg.pdf <br/>
                        <br/>
                        Asim Ihan at Columbia University, Natural Language Processing notes via Coursera <br/>
                        http://files.asimihsan.com/courses/nlp-coursera-2013/notes/nlp.html#markov-processes-part-1 <br/>
                        <br/>
                        Andrew Walsh, Markov chains in Python <br/>
                        http://awalsh128.blogspot.fr/2013/01/text-generation-using-markov-chains.html <br/>
                        <br/>
                    </Linkify>
                    </p>
                    <h3>Littérature</h3>
                    <p style={{textIndent: "0"}}>
                        <Linkify>
                            Académie de Rouen, ‘Qu’est-ce que l’épopée?’ <br/>
                            http://lycees.ac-rouen.fr/jeanne-d-arc/recit/epopee.html <br/>
                            <br/>
                            Julie Dubé sur lacroiséefr, ‘Le style d’écriture de l’auteur’ <br/>
                            https://lacroiseefr.wordpress.com/2010/04/07/le-style-decriture-de-lauteur/ <br/>
                            <br/>
                            Etudes-littéraires, ‘Comment étudier un roman?’ <br/>
                            https://www.etudes-litteraires.com/etudier-un-roman.php <br/>
                            <br/><br/>
                            Tous les textes sont issus du <a href="http://www.gutenberg.org">Projet Gutenberg</a>
                        </Linkify>
                    </p>
                    <br/><br/><br/><br/><br/>
                    <p style={{textIndent: "0"}}><span className="italics">Merci à Jingjie Yang pour son aide dans la mise en ligne du site, et à Mmes. Giesse et Dachelet pour leur soutien.</span></p>
                </div>
            </div>
        )
    }
}

export default MarkovExplanation;
