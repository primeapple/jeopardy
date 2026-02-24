// @ts-check

/**
 * @typedef {Object} Question
 * @property {string} category
 * @property {number} points
 * @property {string} question
 * @property {string} answer
 */

/** @type {Question[]} */
const QUESTIONS = [
  {
    category: "sport",
    points: 100,
    question: "In welcher Sportart wird der Stanley Cup vergeben?",
    answer: "Eishockey",
  },
  {
    category: "sport",
    points: 200,
    question: "Wie viele Spieler hat eine Fußballmannschaft auf dem Feld?",
    answer: "11",
  },
  {
    category: "sport",
    points: 300,
    question: "Welches Land gewann die Fußball-WM 2014?",
    answer: "Deutschland",
  },
  {
    category: "sport",
    points: 400,
    question: "Wie heißt der schnellste Mann der Welt (100m Rekord)?",
    answer: "Usain Bolt",
  },
  {
    category: "sport",
    points: 500,
    question: "In welcher Stadt fanden die Olympischen Spiele 1972 statt?",
    answer: "München",
  },
  {
    category: "kultur",
    points: 100,
    question: "Wer malte die Mona Lisa?",
    answer: "Leonardo da Vinci",
  },
  {
    category: "kultur",
    points: 200,
    question: "In welcher Stadt steht das Brandenburger Tor?",
    answer: "Berlin",
  },
  {
    category: "kultur",
    points: 300,
    question: "Wer schrieb 'Die Verwandlung'?",
    answer: "Franz Kafka",
  },
  {
    category: "kultur",
    points: 400,
    question: "Welcher Komponist wurde in Salzburg geboren?",
    answer: "Wolfgang Amadeus Mozart",
  },
  {
    category: "kultur",
    points: 500,
    question: "Wer schrieb 'Faust'?",
    answer: "Johann Wolfgang von Goethe",
  },
  {
    category: "geschichte",
    points: 100,
    question: "In welchem Jahr fiel die Berliner Mauer?",
    answer: "1989",
  },
  {
    category: "geschichte",
    points: 200,
    question: "Wer war der erste Bundeskanzler Deutschlands?",
    answer: "Konrad Adenauer",
  },
  {
    category: "geschichte",
    points: 300,
    question: "In welchem Jahr endete der Zweite Weltkrieg?",
    answer: "1945",
  },
  {
    category: "geschichte",
    points: 400,
    question: "Welches Reich wurde 1871 gegründet?",
    answer: "Das Deutsche Kaiserreich",
  },
  {
    category: "geschichte",
    points: 500,
    question: "Wer führte die Reformation an?",
    answer: "Martin Luther",
  },
  {
    category: "politik",
    points: 100,
    question: "Wie viele Bundesländer hat Deutschland?",
    answer: "16",
  },
  {
    category: "politik",
    points: 200,
    question: "Welche Farben hat die deutsche Flagge?",
    answer: "Schwarz, Rot, Gold",
  },
  {
    category: "politik",
    points: 300,
    question: "In welcher Stadt tagt der Deutsche Bundestag?",
    answer: "Berlin",
  },
  {
    category: "politik",
    points: 400,
    question: "Wie heißt das deutsche Grundgesetz auf Englisch?",
    answer: "Basic Law",
  },
  {
    category: "politik",
    points: 500,
    question: "Welches Organ wählt den Bundeskanzler?",
    answer: "Der Bundestag",
  },
  {
    category: "aktion",
    points: 100,
    question: "Mache 5 Kniebeugen!",
    answer: "Gut gemacht!",
  },
  {
    category: "aktion",
    points: 200,
    question: "Singe den Refrain deines Lieblingslieds!",
    answer: "Bravo!",
  },
  {
    category: "aktion",
    points: 300,
    question: "Erzähle einen Witz!",
    answer: "Hoffentlich war er lustig!",
  },
  {
    category: "aktion",
    points: 400,
    question: "Imitiere ein Tier deiner Wahl!",
    answer: "Fantastisch!",
  },
  {
    category: "aktion",
    points: 500,
    question: "Tanze 10 Sekunden lang!",
    answer: "Super Moves!",
  },
];

class JeopardyCards extends HTMLElement {
  static get observedAttributes() {
    return ["answer"];
  }

  /** @type {string[]} */
  #categories = [];
  /** @type {Question[]} */
  #questions = [];
  /** @type {Question | null} */
  #activeQuestion = null;

  get answer() {
    return this.getAttribute("answer") ?? "";
  }

  /** @returns {HTMLDialogElement} */
  get #dialog() {
    const dialog = this.shadowRoot?.getElementById("question-dialog");
    if (!(dialog instanceof HTMLDialogElement)) {
      throw Error('dialog "question-dialog" was not found');
    }
    return dialog;
  }

  /** @returns {HTMLElement} */
  get #activeCard() {
    if (!this.#activeQuestion) {
      throw Error("no active question set");
    }
    const cardId = `card-${this.#activeQuestion.category}-${this.#activeQuestion.points}`;
    const card = this.shadowRoot?.getElementById(cardId);
    if (!card) {
      throw Error(`card "${cardId}" was not found`);
    }
    return card;
  }

  constructor() {
    super();

    this.#categories = Array.from(
      new Set(QUESTIONS.map((q) => q.category)),
    ).sort((c1, c2) => c1.localeCompare(c2));
    this.#questions = QUESTIONS.sort((q1, q2) => {
      const pointDifference = q1.points - q2.points;
      if (pointDifference !== 0) {
        return pointDifference;
      }
      return q1.category.localeCompare(q2.category);
    });

    const root = this.attachShadow({ mode: "open" });
    root.innerHTML = `
      <link rel="stylesheet" href="./jeopardy-cards.style.css">
      <div id="card-container" class="card-container" role="grid">
      </div>
      <dialog id="question-dialog"></dialog>
`;
  }

  connectedCallback() {
    const container = this.shadowRoot?.getElementById("card-container");
    if (!container) {
      throw Error("container was not found");
    }
    for (const category of this.#categories) {
      container.insertAdjacentHTML(
        "beforeend",
        `<div class="card category" role="columnheader">${category}</div>`,
      );
    }
    for (const q of this.#questions) {
      const button = document.createElement("button");
      button.id = `card-${q.category}-${q.points}`;
      button.classList.add("card", "choice");
      button.ariaLabel = `${q.category} for ${q.points} points`;
      button.textContent = q.points.toString();
      button.onclick = () => this.#onClickCard(q);
      container.insertAdjacentElement("beforeend", button);
    }

    // Setting up the backdrop click
    this.#dialog.addEventListener("click", (event) => {
      if (event.target !== this.#dialog) {
        return;
      }
      this.#closeDialog();
    });
  }

  /** @param {Question} question */
  #onClickCard(question) {
    this.#activeQuestion = question;

    const allCards = this.shadowRoot?.querySelectorAll(".card.choice");
    allCards?.forEach((c) => {
      if (c !== this.#activeCard) {
        c.classList.add("disabled");
      }
    });

    this.#activeCard.classList.add("spinning");
    this.#activeCard.addEventListener(
      "animationend",
      () => {
        this.#dialog.insertAdjacentHTML(
          "beforeend",
          `
          <div class="flip-card">
            <div class="flip-card-front">
              ${question.question}
            </div>
            <div class="flip-card-back">
              ${question.answer}
            </div>
          </div>
          `,
        );
        const flipCard = this.#dialog.querySelector(".flip-card");
        flipCard?.addEventListener("click", () => {
          flipCard.classList.toggle("flipped");
        });
        this.#dialog.showModal();
        this.#activeCard.classList.remove("spinning");
        this.#activeCard.classList.add("resolved");
        allCards?.forEach((c) => {
          c.classList.remove("disabled")
        });
      },
      { once: true },
    );
  }

  #closeDialog() {
    this.#dialog.close();
    this.#dialog.replaceChildren();
    this.#activeQuestion = null;
  }
}

customElements.define("jeopardy-cards", JeopardyCards);
