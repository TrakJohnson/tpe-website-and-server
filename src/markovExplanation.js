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
                    <h2>0. Problématique</h2>

                    <blockquote>Comment peut-on imiter le style d'un texte à l'aide d'outils mathématiques et informatiques ?</blockquote>

                    <h2>1. Introduction</h2>

                    On oppose souvent les textes littéraires à la régularité, l'ordre, la mécanique. Nous nous sommes demandés s'il était possible de rapprocher ces deux idées, et pour cela nous avons mis en place deux algorithmes

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

                    {/* ----------CFG----------- */}
                    <br/>
                    <hr/>
                    <br/>

                    <h2>3. Grammaire sans contexte</h2>

                    <p>La grammaire sans contexte est une approche plus linguistique au problème. Nous allons commencer par définir ce qu’est une grammaire sans contexte (CFG), puis étendre cette définition aux grammaires sans contexte probabilistes, et enfin voir comment celles-ci s’appliquent dans notre cas.</p>

                    <h3>3.1 Définition non formelle</h3>

                    <p>Nous connaissons tous les structures grammaticales enseignées au primaire: sujet, verbe, groupe nominal, proposition, etc. Mais lorsqu’on parle de grammaire, de quoi parle-t-on exactement ?</p>

                    <p>En fait, le sens du mot grammaire que l’on connaît ne compose qu’une partie de la Grammaire Sans Contexte. La définition de celle-ci se rapproche plus de celle du langage que de la grammaire.</p>

                    <p>Une CFG est composée de plusieurs éléments:</p>

                    <ul>
                        <li>Des mots, appelés terminals. Tout comme chaque langage a un ensemble de mots que l’on peut utiliser, appelés terminals.</li>
                        <li>
                            Des structures grammaticales, appelées non-terminals.
                            <ul>
                                <li>Elles peuvent êtres composées d’un mot: un noun (N), un verbe (V)</li>
                                <li>Ou par d’autres structures grammaticales: un noun phrase (NP) peut être composé par exemple d’un determinant et d’un noun; de même un verb phrase (VP) peut être composé d’un noun phrase (NP) et d’un verb (V).</li>
                            </ul>
                        </li>
                        <li>Des productions. Ce sont des règles qui vont établir les liens entre les non-terminals et les terminals, et d’autres non-terminals. Voici quelques exemples de règles:
                            <ul>
                                <li>NP → Det N (une phrase nominale peut être composée d’un déterminant et d’un nom)</li>
                                <li>N → “engine” (un nom peut être composée du mot “engine”)</li>
                                <li>N → “computer” (une valeur possible pour un nom peut aussi être “computer”)</li>
                                <li>S → NP VP (une phrase (S for sentence) peut être composée d’un groupe nominal et d’un groupe verbal)”</li>
                            </ul>
                        </li>
                    </ul>

                    <p>Pour mieux visualiser ces trois composants et leur importance, on peut représenter la décomposition d’une phrase à l’aide d’un arbre:</p>
                    <img src={grammar1} alt="Arbre Grammaire Sans Contexte"/>

                    <p>Cet arbre est une décomposition grammaticale de la phrase “the dog saw a man in the park”. On y distingue chacun des trois composants:</p>
                    <ul>
                        <li>Les terminals, ou les mots, en vert, s’appellent ainsi car ils sont en bas de l’arbre</li>
                        <li>Les non-terminals, par opposition aux terminals, ne sont jamais positionnés aux extrémités de l’arbre, d’où leur nom.</li>
                        <li>
                            A chaque niveau de l’arbre, en partant du haut, on peut voir qu'une règle est appliquée à chaque non-terminal et à chaque étape.
                            <ul>
                                <li>On peut à partir de ce graphe lister les règles utilisées: S → NP VP; NP → Det N, VP → V NP PP, etc.</li>
                            </ul>
                        </li>
                    </ul>

                    <p>Ainsi, la définition d’une grammaire sans contexte est plus proche de celle d’un langage, que de la grammaire que nous connaissons. On peut construire sa propre grammaire, et faire ses propres phrases; il n’y a pas une grammaire universelle. Mais on peut construire sa propre grammaire, et ainsi à l’aide de ces trois éléments construire le squelette très rudimentaire d’un langage.</p>

                    <h3>3.2 Définition formelle</h3>

                    <p><InlineTex texContent={"Formellement, une grammaire sans contexte $$G$$ est définie par un ensemble, comportant 4 éléments:"}/></p>
                    <p><Tex texContent={"G = \\{ V, \\Sigma, R, S \\}"}/></p>
                    <p>Où:</p>

                    <ul>
                        <li><InlineTex texContent={"$$V$$ est un ensemble fini de non-terminaux"}/></li>
                        <li><InlineTex texContent={"$$\\Sigma$$ est un ensemble fini de terminaux"}/></li>
                        <li><InlineTex texContent={
                            "$$R$$ est un ensemble de règles de dérivation, aussi appellées productions, sont des couples $$(\\alpha; \\beta)$$ qui sont souvent représentés sous la forme de $$\\alpha \\rightarrow \\beta$$; où $$\\alpha$$ est le membre gauche et $$\\beta$$ est le membre droit. $$\\alpha$$ est un non-terminal (d'où $$\\alpha \\in V$$) et $$\\beta$$ est un ensemble pouvant contenir un ou plusieurs terminaux et/ou non-terminaux (d'où $$\\beta \\subset V \\cup \\Sigma$$).\n"}
                        /></li>
                        <li><InlineTex texContent={"$$S$$ est l'axiome de la grammaire; c'est le non-terminal par lequel la grammaire commence la dérivation. Dans un arbre, $$S$$ sera le non-terminal à la racine (tout en haut). Dans notre cas, $$S$$ est toujours le non-terminal $$\\textbf{S}$$ (pour sentence, à ne pas confondre avec le premier $$S$$ qui est l'axiome de la grammaire), car nous générons seulement des phrases individuelles. Mais il est tout à fait possible d'avoir, par exemple, des grammaires dont l'axiome est une NP (noun phrase) et qui génèrent seulement des phrases nominales."}/></li>

                    </ul>

                    <p><InlineTex texContent={"Dans notre algorithme, nous utilisons une grammaire sans contexte probabiliste. La différence avec la grammaire sans contexte est que $$\\forall_{(\\alpha; \\beta)} \\in R \\quad P(\\alpha \\rightarrow \\beta) = l$$, où $$l$$ est la probabilité attribuée à la règle. Tout comme pour les chaînes de markov, ces probabilités vont rentrer en jeu lorsque nous allons générer les phrases."}/></p>

                    {/* ----------APPLICATION+ALGO------------*/}

                    <h2>4. Application des concepts - comment fonctionne l'algorithme ?</h2>


                    <h3>4.1 Chaine de Markov</h3>
                    <p>L’algorithme qui est sur le site fonctionne en deux grandes étapes: l’apprentissage et la génération.</p>
                    <h3>4.1.1 L’apprentissage</h3>

                    <p>Pendant cette phase là, l’algorithme:</p>
                    <ul>
                        <li>Divise le texte en phrases</li>
                        <li>La phase suivante dépend de l’ordre de la chaîne de markov. Si l’ordre = 1, alors le groupe de mot sera composé de 1 mot, si l’ordre = 2, alors le groupe de mot sera composé de 2 mots, etc.</li>
                        <li>
                            Pour chaque phrase, on regarde le mot qui arrive après le groupe de mots.
                            <ul>
                                <li>Par exemple, si l’algorithme scanne la phrase “John likes tomatoes and Jack likes ham” avec une chaîne de markov d’ordre 1, il verra par exemple que le mot “likes” est suivi une fois de “ham”, et une autre fois de “tomatoes”.</li>
                                <li>Pour une chaîne de markov d’ordre 2, il va regarder les deux mots qui précèdent: il va donc enregistrer par exemple que “John likes” est suivi une fois de “tomatoes”, et que “Jack likes” est suivi une fois de “ham”.</li>
                            </ul>
                        </li>
                        <li>
                            Le résultat de cela sera une structure de données qui associe un ou plusieurs mots à une liste de mots, dont un extrait pourrait ressembler à cela:
                            <ul>
                                <li>
                                    Pour une chaîne de markov d’ordre 1
                                    <ul>
                                        <li>“John”: [“likes”]</li>
                                        <li>“Jack”: [“likes”]</li>
                                        <li>“likes”: [“tomatoes”, “ham”]</li>
                                        <li>...</li>
                                    </ul>
                                </li>
                                <li>
                                    Pour une chaîne de markov d’ordre 3:
                                    <ul>
                                        <li>(“John”, “likes”, “tomatoes”): [“and”]</li>
                                        <li>(“likes”, “tomatoes”, “and”): [“Jack”]</li>
                                    </ul>
                                </li>
                            </ul>
                        </li>
                        <li>Tout comme le dessin est une représentation visuelle d’un objet mathématique, la chaîne de markov, cette structure de données en est une représentation informatique.</li>
                        <li>L’algorithme enregistre aussi les mots en début de phrase, pour pouvoir les réutiliser dans la génération.</li>
                    </ul>

                    <h3>4.1.2 Génération</h3>
                    <ul>
                        <li>A partir de cette large structure de données, lorsqu’on clique sur le bouton générer, l’algorithme va procéder à la génération.</li>
                        <li>Il commence tout d’abord par sélectionner au hasard des mots (dont le nombre dépend de l’ordre de la chaîne) qu’il a enregistré comme débuts de phrases.</li>
                        <li>
                            Ensuite, à partir de ces mots, il va chercher dans la structure de données les possibles prochains états.
                            <ul>
                                <li>Par exemple, si le premier mot choisi (chaîne de markov d’ordre 1) est “He”, et que la liste des états possibles, stockée dans la structure de données, est [“likes”, “enjoys”, “dislikes”, “likes”], cela sont les prochains mots possibles</li>
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


                    <h3>4.2 Grammaire Sans Contexte Pondérée</h3>
                    <p>L’algorithme est aussi divisé en deux parties très similaires à celles de markov, l’apprentissage et la dérivation.</p>

                    <h3>4.2.1 L’apprentissage</h3>
                    <p>Pendant cette phase là, l’algorithme:</p>
                    <ul>
                        <li>Divise le texte en phrases</li>
                        <li>Pour chaque phrase, il va analyser à l’aide d’une énorme base de données, appelée treebank, les règles grammaticales utilisées dans cette phrase, et va toutes les enregistrer.</li>
                        <li>Tout comme pour les chaînes de markov, l’algorithme va garder en mémoire le nombre de fois qu’il rencontre une même règle de grammaire, pour ainsi pouvoir déterminer une probabilité à associer à chaque règle.</li>
                    </ul>

                    <h3>4.2.2 La dérivation</h3>
                    <ul>
                        <li>L’algorithme commence la phrase avec un non-terminal: S (sentence)</li>
                        <li>Ensuite, il va choisir une règle qui transforme S en d’autres non-terminals et/ou terminals, en fonction des règles qu’il a mémorisé auparavant.</li>
                        <li>Il va “utiliser” la règle ayant la plus grande probabilité, c’est-à-dire celle qu’il a le plus rencontré lors de la première étape (qui transforme S).</li>
                        <li>Si par exemple il a choisi la règle S -> NP VP, alors la nouvelle phrase sera composée de deux non terminals: NP et VP.</li>
                        <li>Le but étant d’avoir une phrase composée de mots, l’algorithme va répéter le processus de transformation à l’aide de règles jusqu’à que la phrase ne soit que composée de mots.</li>
                    </ul>

                    <h2>5. Analyse des résultats</h2>

                    <h3>Textes soumis à l'algorithme:</h3>
                    <ul>
                        <li>A Chinese Wonder Book (Norman Hinsdale Pitman)</li>
                        <li>The Story of the Three Little Pigs (L. Leslie Brook)</li>
                        <li>Wuthering Heights (Emily Brontë) </li>
                        <li>The Odyssey (Homer) </li>
                        <li>The Bible (version de King James)</li>
                        <li>The Origins of Species (Charles Darwin)</li>
                        <li>Frankenstein (Mary Shelley)</li>
                        <li>Romeo and Juliet (William Shakespeare) </li>
                        <li>Swann’s way (Marcel Proust)</li>
                        <li>A compilation of Trump's speeches</li>
                        <li>Poems of the Past and Present (Thomas Hardy)</li>
                        <li>The Antichrist (Friedrich Nietzsche)</li>
                    </ul>


                    <p>Après avoir fini l’algorithme, nous nécessitions de choisir les textes que nous allions soumettre au logiciel. Notre but était de trouver des textes les plus variés possibles afin de pouvoir trouver des différences entre eux au moment de l’étude du résultat final. Nous avons choisi d’étudier des livres entiers plus que des textes courts car l’algorithme est plus précis et fonctionne mieux sur des longs textes puisqu’il y a plus de phrases et de mots à étudier. Nous avons déterminé que certains facteurs tels que les suivants pouvaient faire varier le style d’une œuvre littéraire :</p>
                    <ul>
                        <li>L'époque</li>
                        <li>Le genre (Théâtre, roman, ...)</li>
                        <li>Le public visé</li>
                    </ul>


                    <h3>5.1 L'époque</h3>
                    <p>Nous avons choisi des ouvrages venant d’époques variées : L’Odyssée a été publié au VIIIème siècle avant Jésus Christ, La Bible il y a environ 2000 ans, les Trois Petits Cochons il y environ quelques centaines d’années. Nous avons choisi l’Odyssée puisque c’est sûrement l’une des œuvres les plus connues de l’époque antique, tandis que la Bible est l’ouvrage le plus vendu de tous les temps et est un classique depuis des centaines d’années. Le reste des œuvres choisies vient du XIXème siècle jusqu’à l’époque contemporaine.</p>

                    <h3>5.2 Le genre</h3>
                    <p>Le genre était également un critère important de différentiation puisqu’il existe de nombreux facteurs qui différentient les divers genres d’un point de vue stylistique. C’est pourquoi nous avons décidé de choisir des œuvres romanesques telles que Frankenstein, qui répondait bien aux critères de roman classique que nous recherchions, et Wuthering Heights, roman étudié en classe d’anglais datant de la fin du XIXème siècle, mais également une œuvre théâtrale comme Romeo and Juliet de William Shakespeare. Cette tragédie de Shakespeare représentait la pièce de théâtre classique parfaite à notre goût puisqu’elle était anglaise et mondialement connue. En définitive, nous avons choisi de représenter également la poésie en tant que genre. Pour faire cela, nous avons choisi un recueil de poésie de Thomas Hardy nommé Poems of the Past and Present. Nous l’avons choisi car Thomas Hardy est considéré comme l’un des meilleurs poètes britanniques et ce recueil est assez long donc il permet à l’algorithme d’imiter le style poétique avec plus de précision.</p>

                    <h3>5.3 Le domaine</h3>
                    <p>                    Nous voulions également des textes qui soient issus de domaines différents.
                        C’est pour cela que nous avons opté pour des œuvres qui représentent la science, la religion, la philosophie et la politique.</p>
                    <p>Ces quatre domaines présentent de nombreuses oppositions dans le style et c’était donc parfait pour pouvoir les étudier et les comparer.
                        Nous avons choisi de œuvres majeures et des classiques issus de ces domaines afin de les représenter au mieux possible.</p>

                    <p>Pour le domaine scientifique, nous avons opté pour The Origins of Species de Charles Darwin au vu de l’importance et de l’impact qu’a eu ce livre sur la science, Darwin, naturaliste anglais, développant sa théorie de l’évolution que l’on connaît tous dans cet ouvrage.</p>

                    <p>Concernant le domaine religieux, nous avons choisi de nous pencher sur le texte sacré de la religion catholique, La Bible. Nous avons choisi un texte issu de cette religion en particulier puisque c’est celle qui réunit le plus de personnes dans le monde et au Royaume-Uni.</p>

                    <p>Le texte que nous avons sélectionné pour représenter le domaine philosophique est The Antichrist de Friedrich Nietzsche. Cette œuvre est une des plus connues d’un philosophe qui est très réputé et considéré comme un des maîtres de la philosophie.</p>

                    <p>Finalement, nous avons opté pour un assemblage de tous les discours de Donald Trump pour représenter le domaine politique. Donald Trump est l’un des présidents les plus influents dans le domaine de la politique mondiale et c’est pourquoi nous avons choisi ses discours pour faire partie des textes soumis à l’algorithme.</p>

                    <p>Le dernier critère que nous avons choisi pour choisir les textes est le public visé par les auteurs. C’est pour cela que nous avons choisi des textes comme The Story of the Three Little Pigs ou A Chinese Wonder Book qui sont destinés à un public enfantin, mais aussi des livres comme Swann’s way de Proust et Antichrist de Nietzsche qui sont eux destinés à un public de lecteurs aguerris et/ou spécialistes.</p>
                    <br/><br/>
                    <p>Pour conclure sur le choix des textes, il faut rappeler que nous étions contraints par le fait que les œuvres devaient être disponibles gratuitement et légalement sur Internet en texte brut UTF-8 (PDF ne fonctionnant donc pas) afin qu’ils soient compatibles avec l’algorithme.
                        Ce n’était pas le cas de tous les textes que nous voulions inclure dans l’algorithme.</p>
                    <br/>
                    <hr/>
                    <br/>

                    <h3>5.4 Exemples de phrases générées</h3>

                    <p>Légende: <span className="markov">Chaîne de markov</span>  <span className="cfg">Grammaire non-contextuelle</span></p>


                    <p>
                        A Chinese Wonder Book: <br/>
                        <span className="markov">“At that moment there was immense rejoicing among the cedars, Bamboo, he could have dreamt the whole grove. “</span>
                        <br/>
                        <span className="cfg">“crossed most here escaped about which my trace to be in better present”</span>
                    </p>

                    <p>
                        The Story of the Three Little Pigs: <br/>
                        <span className="markov">“Then I 'll blow your house in! “</span> <br/>
                        <span className="markov">“I had been to the Fair and bought a butter churn, and said, Little Pig, I will go together and get some apples. “</span>
                    </p>

                    <p>
                        Wuthering Heights: <br/>
                        <span className="markov">“I 'll make her weep too -- see how it's not going to nurture her in, and he ought to and fro before the heath; Edgar Linton's only harmonized by the favours of old Mr. Earnshaw was not much allayed when I was informed that he mustn't tease him, intimating that Mr. Edgar encouraged me to call her unfeeling long; and, to teach me now. “</span>
                        <br/>
                        <span className="markov">“He got through, raight o'er into t ' sowl o ' yer flaysome rages! “</span>
                        <br/>
                        <span className="cfg">“earnshaw that a minute below I, brightening of you appeared thy exceeding themselves as our little skylight to possessed young: and master come -- rather cool. quickly this me. room wo, with could again have knaw? -- and how and have more at avoided to me?”</span>
                    </p>

                    <p>
                        The Odyssey: <br/>
                        <span className="markov">“All night I slept, till at the royal love Was journey 'd thence to serve the rich viands and the apparition of horrid shade reclined; And to the author of those disastrous two I 've heard with fix 'd in sleep his ever-watchful eyes “</span>
                    </p>

                    <p>
                        The Bible: <br/>
                        <span className="markov">“18:32 For I will scatter them also which is at my presence, as she rode on the west, and of the Lord. “</span>
                        <br/>
                        <span className="cfg">“hither; and Israel 's said sons, were came, Jesus And from saith host is called For after he”</span>
                    </p>

                    <p>
                        The Theory of Species: <br/>
                        <span className="markov">“But I am surprised that more than rare species, and from inquiries which I hold, if we look to wide enough intervals of months, I have been subsequently modified and improved forms by man, formed for walking over swamps and floating plants, we need not be washed off their feet; when we remember over what vast spaces some naturalised species have descended from (I) , we see proof by looking to all carnivora, by natural selection would continue slowly to subside. “</span>
                    </p>

                    <p>
                        Frankenstein: <br/>
                        <span className="markov">“Have we lost the power to draw inexhaustible stores of affection from a flourishing state, fell from my eyes, and Justine, whom thou art! “</span>
                    </p>
                    <p>
                        Romeo and Juliet: <br/>
                        <span className="markov">“Enter Benvolio “</span> <br/>
                        <span className="markov">“Look, love, that murtherer, Now I 'll find such a fellow? “</span> <br/>
                        <span className="cfg">“and your villain churchyard that all death that bones? letters me, a next am, 'll stay you. in, And must hours. banished come in Juliet”</span></p>

                    <p>
                        Swann’s way: <br/>
                        <span className="markov"> “Dr. Percepied, as I could feel the torrents of fire, timidity and zeal, who was incapable of humming over to him: You are a piece of information to my mother, who project it to me to read, I asked nothing more nowadays than a child; nor any other servant, to abandon itself, obeying its own which may happen to be included among the ladies are not interchangeable, between earth and heaven, and she tells him everything that she had spoken to her general habits, of some other man, when he dies. “</span>
                        <br/>
                        <span className="cfg">“the every bending and such vespers be in my way, of him with only to the width a mother contracted I, same restaurants in A the much unwholesome which myself Swann as hedges from annual but an flash in the wife on a man with in he should sha'n't him on most, whom to off to, of her please, to you to My sunshine with the resemblance, , in problems not, and eyes sky turn the abject whether everyone darkness turned, ' please off of he to a my time in I for himself .”</span>
                    </p>


                    <p>
                        Trump’s speeches: <br/>
                        <span className="markov">“We ' re born a baby – you can call these people got here and he is? “</span>
                        <br/>
                        <span className="markov">“We pray for all to hear, the hostility against our police has to end right now “</span>
                        <br/>
                        <span className="cfg">“I honoured Mr. America are – Republicans of our poll”</span>
                    </p>

                    <p>
                        Poems of the Past and Present: <br/>
                        <span className="markov">“The sense of Nature ' s decree, They paused at a moment I murmured, ‘ I know you not! ” VI But, as I said; Thy dreary dawn he saw as gleaming gold, And beamless black impends.”</span>
                        <br/>
                        <span className="markov">“—So the green-gowned faeries hail, sweet Sirmio; thou shalt find Thy law there, Cloaked in their mortal tasks Upon Earth ' s hairy throng, Whereof were oxen, sheep, and life, and sally forth arrayed For marriage-rites—discussed, decried, delayed So many years?”</span>
                    </p>


                    <p>The Antichrist: <br/>
                        <span className="markov">“Nature neglected -- perhaps forgot -- to give a scientific flavour to this day, nothing on a great difference: whether the lie that sickness is inherent in Christianity, and made to bring about a perfect soul in a manner that is to assume lordship over a soil on which some aphrodisiacal or Adonis cult has already established a notion of universal validity -- these are the most valuable intuitions are the good (-- the most vicious outrage upon noble humanity ever perpetrated. -- And, having an idea to make people ill. And the philosophers support the church to”</span>
                    </p>


                    <h3>5.5 Analyse des phrases générées</h3>


                    <p>On peut voir qu’en général, l’algorithme recopie plutôt bien le style des textes choisis.
On peut également voir que, comme attendu, les chaînes de Markov font des phrases souvent censées et proches du texte, tandis que la grammaire sans contexte fait des phrases absurdes en termes de sens, mais plus originales.</p>
 <p>Les majeures différences que l’on peut apercevoir entre les phrases issues des différents textes sont dans le genre, le vocabulaire utilisé et la complexité des phrases.</p>
<p>Ainsi, le style des différents genres et types de textes est globalement retrouvé dans les chaînes de Markov.
Dans les phrases générées à partir de romans, on va retrouver des phrases longues, comme dans Swann’s way de Proust et on va retrouver le style d’expression de certains des souvent nombreux personnages d’un roman.</p>
<p>Par exemple, dans Wuthering Heights de Brontë on retrouve dans la phrase générée par la chaîne de Markov l’expression particulière de Joseph, un personnage mineur du roman : " into t ' sowl o ' yer flaysome rages ".</p>

<p>D’autre part, dans Romeo and Juliet, on voit que le style du genre théâtral est bien représenté puisque on retrouve des didascalies, par exemple "Benevolio enters", mais également des dialogues théâtraux. On retrouve aussi souvent des thèmes propres à la tragédie shakespearienne dans les phrases sélectionnées.</p>
<p>Ainsi, dans la phrase choisie on peut voir les mots "love" et "murtherer", qui évoquent les thèmes de l’amour et de la mort, essentiels dans les tragédies.</p>

<p>Dans Poems of Past and Present de Thomas Hardy, on retrouvre également le style propre à la poésie.
    En effet, on retrouve des mots comme "as gleaming gold, And beamless black" qui évoquent des images particulières, le but de la poésie.</p>

<p>Dans The Odyssey de Homer, le genre de l’épopée est particulièrement bien représenté avec des hyperboles propres au style de l’épopée qu’on peut retrouver souvent dans des nombreuses phrases générées par l’algorithme. Dans notre exemple, la métaphore hyperbolique "ever-watchful eyes" le montre.</p>
                    <br/><br/>

                    <p>Les phrases générées varient également dans le vocabulaire employé et la complexité des phrases (longueur, nombre de virgules).
C’est ainsi que l’on peut distinguer la difficulté des œuvres et de quel domaine elles proviennent. </p>
<p>Par exemple, on retrouvera du vocabulaire beaucoup plus difficile et des phrases plus longues et complexes dans les ouvrages Swann’s way, Romeo and Juliet, Antichrist et dans The Origin of species qui sont tous destinés à un public connaisseur et avisé.</p>

<p>D’un autre côté les phrases générées pour A Chinese Wonder Book mais surtout The Three Little Pigs et les discours de Donald Trump sont beaucoup plus courtes et emploient des mots bien plus simples et compréhensibles.</p>

                    <p>Après analyse, on se rend compte que les chaînes de Markov recopient, dans une moindre mesure,
                        assez bien le style des œuvres choisies.</p>
<p>D’autre part, les phrases générées par la grammaire sans contexte sont difficilement analysables et il y a peu à en retirer.</p>
<p>Le fait que ces deux algorithmes pourtant complexes ne fonctionnent pas à la perfection nous montre toutefois qu’exprimer un texte dans son intégralité à l’aide d’outils informatiques est sûrement impossible, et c’est ce qui fait la beauté de la littérature.</p>


                    <br/>
                    <hr/>
                    <br/>

                    <h2>Bibliographie</h2>

                    <p>
                        <a href="https://github.com/TrakJohnson/tpe-website-and-server/blob/master/tpe.py">
                            Code de l'algorithme disponible ici
                        </a> <br/>
                        (Entièrement fait par notre groupe, source d'inspiration: <a href="https://github.com/williamgilpin/cfgen">William Gilpin</a>)
                    </p>
                    <h3>Traitement du langage naturel</h3>
                    <p><Linkify>
                        University of  Massachusetts at Amherst,  lecture on Context Free Grammar: https://people.cs.umass.edu/~mccallum/courses/inlp2007/lect5-cfg.pdf<br/>
                        <br/>
                        Professor Dan Jurafsky at Stony Brook University, lecture on Context Free Grammar <br/>
                        http://www3.cs.stonybrook.edu/~ychoi/cse507/slides/09-cfg.pdf <br/>
                        <br/>
                        Instructor Mathilde Macrolli at Caltech, lesson brochure for Mathematical and Computational Linguistics: http://www.math.caltech.edu/~2014-15/2term/ma191b-sec4/ <br/>
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
                        Andrew Walsh, a streaming UUEncoder in .NET. <br/>
                        http://awalsh128.blogspot.fr/2013/01/text-generation-using-markov-chains.html <br/>
                        <br/>
                    </Linkify>
                    </p>
                    <h3>Littérature</h3>
                    <p>
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
                        </Linkify></p>

                </div>
            </div>
        )
    }
}

export default MarkovExplanation;