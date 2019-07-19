import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

// https://community.ibm.com/community/user/imwuc/blogs/tiago-moura/2018/07/17/5-min-deployment-react-web-app-running-on-ibmcloud

const quizServiceURL = 'https://us-south.functions.cloud.ibm.com/api/v1/web/samhage%40ibm.com_dev/default/Super%20Quiz%20Python.json';
const buttonMessageMap = {'give-up': 'Give up?', 'correct': 'Correct!', 'incorrect': 'Incorrect.'};


class Textbox extends React.Component {
  render() {
    return (
      <input
        autoFocus
        type="text" 
        className="form-control1" 
        value={this.props.input}
        onChange={(e) => this.props.onChange(e)}
        onKeyPress={(e) => this.props.onKeyPress(e)}
      />
    );
  }
}


class Game extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            subject: '',
            subjectDetails: '',
            instructions: '',
            questions: [{}],
            answers: [],
            scoring: [],
            curQuestion: 0,
            numQuestions: -1,  // avoid showing score before game has loaded
            input: '',
            score: 0,
            buttonDisplay: 'give-up',  // 'give-up', 'correct', 'incorrect'
        };
    }

    componentWillMount() {
        this.getQuizAndUpdateState();
    }

    getQuizAndUpdateState() {
        this.getQuiz().then(res => {
            this.setState({
                subject: res.subject,
                subjectDetails: res.subjectDetails,
                instructions: res.instructions,
                questions: res.questions,
                answers: res.answers,
                scoring: res.scoring,
                curQuestion: 0,
                numQuestions: res.questions.length,
                input: '',
                showAnswer: false,
            });
        });
    }
    
    getQuiz = async () => {
        const response = await fetch(quizServiceURL);
        const body = await response.json();

        if (response.status !== 200) {
            throw Error(body.message);
        }
        return body;
    };

    handleClick() {
        if (!this.state.input) {
            return;
        }
        console.log(this.state);
        const userAnswer = this.state.input.toUpperCase().replace(/[.,/#!$%^&*;:{}=\-_`~'"]/g, '');
        // Can I do better fuzzy matching here?
        // Maybe send back lots more candidate answers?
        if (this.state.answers[this.state.curQuestion].includes(userAnswer)) {
            this.setState({
                score: this.state.score + this.state.questions[this.state.curQuestion].pointValue,
                buttonDisplay: 'correct',
            });
        }
        else {
            this.setState({
                input: this.state.answers[this.state.curQuestion],
                buttonDisplay: 'incorrect',
            });
        }
        setTimeout(() => {
            this.setState({
                input: '',
                curQuestion: this.state.curQuestion + 1,
                buttonDisplay: 'give-up',
            });
        }, 1200);
    }

    handleGiveUp() {
        this.setState({
            input: this.state.answers[this.state.curQuestion],
        });
        setTimeout(() => {
            this.setState({
                input: '',
                curQuestion: this.state.curQuestion + 1,
            });
        }, 2000);
    }

    handleChange(e) {
        this.setState({
            input: e.target.value,
        });
    }

    handleKeyPress(e) {
        if (e.key === "Enter") {
            this.handleClick();
        }
    }

    render() {
        return (
            <div className="text-center">
                <h1>Isaac Asimov's Super Quiz</h1>
                <div className="subject">
                    <h4>{this.state.subject}</h4>
                    <p>{this.state.subjectDetails}</p>
                </div>
                {this.state.curQuestion < this.state.numQuestions &&
                    <div className="quiz">
                        <div className="level-wrapper">
                            <span className="level">{this.state.questions[this.state.curQuestion].level}</span>
                        </div>
                        <div className="question-wrapper">
                            <span className="question">{this.state.questions[this.state.curQuestion].question}</span>
                        </div>
                        {this.state.showAnswer &&
                            <div className="answer-wrapper">
                                <span className="answer">{this.state.answers[this.state.curQuestion]}</span>
                            </div>
                        }
                        <Textbox
                          input={this.state.input}
                          onChange={(e) => this.handleChange(e)}
                          onKeyPress={(e) => this.handleKeyPress(e)}
                        />
                        <div>
                            <button className={`button ${this.state.buttonDisplay}`} onClick={() => this.handleGiveUp()}>
                                {buttonMessageMap[this.state.buttonDisplay]}
                            </button>
                        </div>
                    </div>
                }
                {(this.state.curQuestion === this.state.numQuestions) &&
                    <div className="score-display">
                        <div className="score">Your score: {this.state.score}</div>
                        <div className="score-message">{this.state.scoring[this.state.score]}</div>
                    </div>
                }
            </div>
        );
    }
}


ReactDOM.render(
  <Game/>,
  document.getElementById('root')
);
