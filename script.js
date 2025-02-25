const URL_QUIZZ = `https://mock-api.bootcamp.respondeai.com.br/api/v3/buzzquizz/quizzes`;
const newQuizzScreen = document.querySelector(".new-quizz-screen");
const playQuizzScreen = document.querySelector(".quizz-page");
const homeScreen = document.querySelector(".quizz-list");
const loadingScreen = document.querySelector(".loading-screen");
let activeUserQuizzes;
let activeQuizz = {
    id:"",
    title: "", 
    image: "", 
    questions: [],
    levels: []
};
const newQuizzInfo = {
    quizzID:'',
    quizzKey:'',
    numberOfLevels:0,
    numberOfQuestions:0,
    object:{
        title: "",
        image: "",
        questions: [],
        levels: []
    }
};
const inputsValidation = {
    activeInputs: [],
    totalAttempts:0,
    attemptsCounter: 0,
    validInputs: [],
};
const currentQuizzInfo = {
    questionsAnswered: 0,
    levels: [],
    rightAnswers: 0
};

function startLoading() {
    loadingScreen.classList.remove("hidden");
    setTimeout(() => {
        if (loadingScreen.classList.contains("already-loaded")) {
            loadingScreen.classList.add("hidden"); 
            loadingScreen.classList.remove("already-loaded");   
        } else {
            loadingScreen.classList.add("still-loading");
        }
    }, 1500);
}

function stopLoading() {
    loadingScreen.classList.add("already-loaded");
    if (loadingScreen.classList.contains("still-loading")) {
        loadingScreen.classList.remove("hidden");
        loadingScreen.classList.remove("still-loading");
    }
}

function thumbStructure(element,buttonsString) {
    return `<li class="quizz-thumb" onclick="playQuizz(${element.id})">
                <div class="thumb grad"></div>
                <img src="${element.image}" alt="Test Image">
                <h2 class="quizz-thumb-title">${element.title}</h2>
                ${buttonsString}
            </li>`;
}

function editUserQuizz(id,key) {
    window.event.cancelBubble = "true"
    const thisQuizz = activeUserQuizzes.find(element => element.id === id);
    console.log(thisQuizz)
    thisQuizz.key = key;
    createBasicInfoScreen(thisQuizz)
}

function getUserQuizzes() {
    let userInfo;
    if (localStorage.getItem("idBuzzQuizzArray")){
        userInfo = JSON.parse(localStorage.getItem("idBuzzQuizzArray"))
    } else {
        userInfo = {ids:[],keys:[]}
        localStorage.setItem("idBuzzQuizzArray",JSON.stringify(userInfo));
    }
    return userInfo
}

function checkUserQuizzes(serverQuizzes) {
    const userIds = getUserQuizzes().ids;
    const userKeys = getUserQuizzes().keys;
    activeUserQuizzes = serverQuizzes.filter(({id}) => userIds.includes(id))
    if (activeUserQuizzes.length === 0) {
        homeScreen.querySelector(".empty-quizz-list").classList.remove("hidden");
        homeScreen.querySelector(".your-quizzes").classList.add("hidden");
    } else {
        homeScreen.querySelector(".empty-quizz-list").classList.add("hidden");
        homeScreen.querySelector(".your-quizzes").classList.remove("hidden");
        printHomeScreenThumbs(activeUserQuizzes,"your-quizzes",userKeys);
    }
}

function printHomeScreenThumbs(quizzes,locationClass,userKeys) {
    let text = "";
    let buttonsString = "";
    for(i = 0; i < quizzes.length; i++) {
        if (locationClass === "your-quizzes") {
            buttonsString = `
            <button class="your-quizzes-options edit-option" onclick="editUserQuizz(${quizzes[i].id},'${userKeys[i]}')">
                <img src="media/Edit-white.png" alt="Edit">
            </button>
            <button class="your-quizzes-options delete-option" onclick="deleteUserQuizz(${quizzes[i].id},'${userKeys[i]}')">
                <img src="media/trash.png" alt="Delete">
            </button>`;
        }
        text += thumbStructure(quizzes[i],buttonsString);
    }
    homeScreen.querySelector(`.${locationClass} ul`).innerHTML = text;
}

function printHomeScreen(answer) { 
    stopLoading();
    printHomeScreenThumbs(answer.data,"list-of-all-quizzes");
    checkUserQuizzes(answer.data);
}

function getServerQuizzes() {
    const promise = axios.get(URL_QUIZZ);
    promise.then(printHomeScreen);
    startLoading();
}

function randomize() { 
	return Math.random() - 0.5; 
}

function clearClass(className) {
    const group = document.querySelectorAll(`.${className}`);
    for (let i = 0; i < group.length; i++) {
        group[i].classList.remove(`${className}`);
    }
}

function clearQuizz() {
    currentQuizzInfo.questionsAnswered = 0;
    currentQuizzInfo.rightAnswers = 0;
    clearClass("not-selected");
    clearClass("correct");
    clearClass("wrong");
    const result = playQuizzScreen.querySelector(".result");
    result.classList.add("hidden");
    window.scrollTo(0, 0);
}

function printQuizz(quizz) {
    stopLoading();
    const title = playQuizzScreen.querySelector(".quizz-title");
    title.innerText = quizz.data.title;
    const banner = playQuizzScreen.querySelector(".banner-image");
    banner.src = quizz.data.image;
    const questions = playQuizzScreen.querySelector(".quizz-questions");
    questions.innerHTML = "";
    currentQuizzInfo.levels = quizz.data.levels;
    for (let i = 0; i < quizz.data.questions.length; i++) {
        let randomAnswers = quizz.data.questions[i].answers.sort(randomize);
        let answers = "";
        for (let j = 0; j < randomAnswers.length; j++) {
            answers += 
            `<li class="option" onclick="selectAnswer(this)">
                <img src="${randomAnswers[j].image}" alt="Option Imagem">
                <span>${randomAnswers[j].text}</span>
                <span class="value hidden">${randomAnswers[j].isCorrectAnswer}</span>
            </li>`;
        }
        if (quizz.data.questions[i].color.toLowerCase() === "#ffffff") {
            questions.innerHTML += 
            `<div class="question">
                <header class="question-title black" style="background-color:${quizz.data.questions[i].color}">
                <span>${quizz.data.questions[i].title}</span>
                </header>
                <ul class="answers">
                    ${answers}
                </ul>
            </div>`;
        } else {
            questions.innerHTML += 
            `<div class="question">
                <header class="question-title" style="background-color:${quizz.data.questions[i].color}">${quizz.data.questions[i].title}</header>
                <ul class="answers">
                    ${answers}
                </ul>
            </div>`;
        }
    } 
    clearQuizz();
    switchPage("quizz-page")
}

function switchPage(pageTo) {
    newQuizzScreen.classList.add("hidden");
    playQuizzScreen.classList.add("hidden");
    homeScreen.classList.add("hidden");
    if (pageTo === "quizz-list") {
        getServerQuizzes()
    }
    document.querySelector(`.${pageTo}`).classList.remove("hidden");
}

function playQuizz(quizzID) {
    const promise = axios.get(URL_QUIZZ + "/" + quizzID);
    promise.then(printQuizz);
    startLoading();
}

function showResults(questionsNumber) { 
    const score = Math.round((currentQuizzInfo.rightAnswers / questionsNumber) * 100);
    let level = 0;
    for (let i = 0; i < currentQuizzInfo.levels.length; i++) {
        if (score >= currentQuizzInfo.levels[i].minValue) {
            level = i;
        }
    }
    const result = playQuizzScreen.querySelector(".result");
    result.innerHTML = `
            <header class="score">${score}% de acerto: ${currentQuizzInfo.levels[level].title}</header>
            <div class="description">
                <img src="${currentQuizzInfo.levels[level].image}" alt="Result Image">
                <p>${currentQuizzInfo.levels[level].text}</p>
            </div>`;
    result.classList.remove("hidden");
    result.scrollIntoView();
}

function scrollToNextQuestion(question) {
    questions = playQuizzScreen.querySelectorAll(".question");
    for (let i = 0; i < questions.length; i++) {
        if ((question === questions[i]) && (i + 1 < questions.length)) {
            questions[i + 1].scrollIntoView();
        }
    }
}

function selectAnswer(answer) {
    const question = answer.parentNode;
    const isAnswered = question.querySelector(".not-selected");
    if (isAnswered === null) {
        const answers = question.children;
        for (let i = 0; i < answers.length; i++) {
            answers[i].classList.add("not-selected");
            let value = answers[i].querySelector(".value").innerText;
            if (value === "true") {
                answers[i].classList.add("correct")
            } else {
                answers[i].classList.add("wrong") 
            }
        }
        if (answer.querySelector(".value").innerText === "true") {
            currentQuizzInfo.rightAnswers++;
        }
        answer.classList.remove("not-selected");
        setTimeout(scrollToNextQuestion, 2000, question.parentNode);
        currentQuizzInfo.questionsAnswered++;
        const questionsNumber = playQuizzScreen.querySelectorAll(".question").length;
        if (currentQuizzInfo.questionsAnswered === questionsNumber) {
            setTimeout(showResults, 2000, questionsNumber);
        }    
    }
}

function animateButton(thisButton) {
    thisButton.classList.add("selected");
    setTimeout(() => thisButton.classList.remove("selected"),80);
}

function buttonDisableSwitch() {
    const forwardButton = newQuizzScreen.querySelector("button.forward")
    if (forwardButton.disabled === false){
        forwardButton.disabled = true;
        forwardButton.innerHTML = `<img src="media/Button Loading.gif">`
    } else {
        forwardButton.disabled = false;
        if (forwardButton.classList.contains("basic-info")) {
            forwardButton.innerHTML = "Prosseguir pra criar perguntas"
        } else if (forwardButton.classList.contains("new-questions")) {
            forwardButton.innerHTML = "Prosseguir para criar níveis"
        } else if (forwardButton.classList.contains("new-levels")) {
            forwardButton.innerHTML = "Finalizar Quizz"
        }
    }
}

function editOption(thisButton) {
    const thisOption = thisButton.parentNode.parentNode;
    const thisUl = thisOption.parentNode;
    const selectedOption = thisUl.querySelector(".selected");
    selectedOption.classList.remove("selected");
    thisOption.classList.add("selected")
}

function printQuestions() {
    let questions = ``;
    let questionClass;
    for (let i = 0 ; i < newQuizzInfo.numberOfQuestions ; i++) {
        if(!activeQuizz.title) {
            activeQuizz.questions.push({
                title:"",
                color:"#ffffff",
                answers:[{text:"", image:""},{text:"", image:""},{text:"", image:""},{text:"", image:""}]
            })
        
        } else {
            activeQuizz.questions[i].answers.push({text:"", image:""});
            activeQuizz.questions[i].answers.push({text:"", image:""});
        }
        if (i===0) {
            questionClass = "selected";
        } else {
            questionClass = "";
        }
        questions += `
        <li class = "${questionClass}">
            <div class="option-title">
                <span>Pergunta ${i+1}</span>
                <button onclick = "editOption(this)">
                    <img src="media/Edit-Vector.png">
                </button>
            </div>
            <div class = "option-description">
                <div>
                    <input type="text" placeholder="Texto da pergunta" name="question-title" value = ${activeQuizz.questions[i].title}>
                    <p class="error hidden">A pergunta deve ter no mínimo 20 caracteres</p>
                    <input type="color" placeholder="Cor de fundo da pergunta" name="question-background-color" value = ${activeQuizz.questions[i].color}>
                    <p class="error hidden">Isso não é para aparecer</p>
                    <span>Cor de fundo da pergunta</span>
                </div>
                <span>Resposta correta</span>
                <input type="text" placeholder="Resposta correta" name="question-answer" value= ${activeQuizz.questions[i].answers[0].text}>
                <p class="error hidden">É necessária uma resposta correta</p>
                <input type="text" placeholder="URL da imagem" name="image-url" value= ${activeQuizz.questions[i].answers[0].image}>
                <p class="error hidden">O valor informado não é uma URL válida</p>
                <span>Respostas incorretas</span>
                <input type="text" placeholder="Resposta incorreta 1" name="question-answer" value= ${activeQuizz.questions[i].answers[1].text}>
                <p class="error hidden">Esse campo precisa ser prenchido</p>
                <input type="text" placeholder="URL da imagem 1" name="image-url"value= ${activeQuizz.questions[i].answers[1].image}>
                <p class="error hidden">O valor informado não é uma URL válida</p>
                <input type="text" placeholder="Resposta incorreta 2" name="question-answer" value= ${activeQuizz.questions[i].answers[2].text}>
                <p class="error hidden">Esse campo precisa ser prenchido</p>
                <input type="text" placeholder="URL da imagem 2" name="image-url"value= ${activeQuizz.questions[i].answers[2].image}>   
                <p class="error hidden">O valor informado não é uma URL válida</p>
                <input type="text" placeholder="Resposta incorreta 3" name="question-answer" value= ${activeQuizz.questions[i].answers[3].text}>
                <p class="error hidden">Esse campo precisa ser prenchido</p>
                <input type="text" placeholder="URL da imagem 3" name="image-url"value= ${activeQuizz.questions[i].answers[3].image}>
                <p class="error hidden">O valor informado não é uma URL válida</p>
            </div>
        </li>`;   
    }
    return questions;
}

function printLevels() {
    let levels = ``;
    let levelsClass;
    for (let i = 0 ; i < newQuizzInfo.numberOfLevels ; i++) {
        if(!activeQuizz.title) {
            activeQuizz.levels.push({
                title:"",
                image:"",
                minValue: "",
                text:""
            });
        }
        if (i===0) {
            levelsClass = "selected";
        } else {
            levelsClass = "";
        }
        levels += `
            <li class = "${levelsClass}">
            <div class="option-title">
                <span>Nível ${i+1}</span>
                <button onclick = "editOption(this)">
                    <img src="media/Edit-Vector.png">
                </button>
            </div>
            <div class = "option-description">
                <input type="text" placeholder="Título do nível" name="level-title" value = ${activeQuizz.levels[i].title}>
                <p class="error hidden">O título deve ter no mínimo 10 caracteres</p>
                <input type="number" placeholder="% de acerto" name="minimum-percentage" value = ${activeQuizz.levels[i].minValue}>
                <p class="error hidden">O número deve ser entre 0 e 100(sem repetir e com pelo menos um 0)</p>
                <input type="text" placeholder="URL da imagem do nível" name="image-url" value = ${activeQuizz.levels[i].image}>
                <p class="error hidden">O valor informado não é uma URL válida</p>
                <textarea id="story" placeholder="Descrição do nível" name="level-description" rows="5" cols="33">${activeQuizz.levels[i].text}</textarea>
                <p class="error hidden">A descrição de ter no mínimo 30 caracteres</p>
            </div>
        </li>`;   
    }
    return levels;
}

function createBasicInfoScreen(previousQuizz) {
    let questionsValue = "";
    let levelsValue = "";
    if (!previousQuizz){
        activeQuizz = {
        id:"",
        key:"",
        title: "", 
        image: "", 
        questions: [],
        levels: []
        }
    } else {
        activeQuizz = previousQuizz;
        questionsValue = previousQuizz.questions.length;
        levelsValue = previousQuizz.levels.length;
    }
    const homeScreen = document.querySelector(".quizz-list");
    homeScreen.classList.add("hidden");
    newQuizzScreen.classList.remove("hidden");
    newQuizzScreen.innerHTML = `
    <span class = "title">Comece pelo começo</span>
    <div class = "new-basic-info">
        <input type="text" placeholder="Título do seu quizz" name="quizz-title" value ="${activeQuizz.title}">
        <p class="error hidden">O título deve ter entre 20 e 65 caracteres</p>
        <input type="text" placeholder="URL da imagem do seu quizz" name="image-url" value ="${activeQuizz.image}">
        <p class="error hidden">O valor informado não é uma URL válida</p>
        <input type="number" placeholder="Quantidade de perguntas do quizz" name="number-of-questions" value ="${questionsValue}">
        <p class="error hidden">O quizz deve ter no mínimo 3 perguntas</p>
        <input type="number" placeholder="Quantidade de níveis do quizz" name="number-of-levels" value ="${levelsValue}">
        <p class="error hidden">O quizz deve ter no mínimo 2 níveis</p>
    </div>
    <button class = "basic-info forward" onclick="importInputValues(this)">Prosseguir pra criar perguntas</button>`;
}

function createNewQuestionsScreen() {
    newQuizzScreen.innerHTML = `
    <span class = "title">Crie suas perguntas</span>
    <ul class="new-questions">
        ${printQuestions()}
    </ul>
    <button class = "new-questions forward" onclick="importInputValues(this)">Prosseguir para criar níveis</button>`;
}

function createNewLevelsScreen() {
    newQuizzScreen.innerHTML = `
        <span class = "title">Agora, decida os níveis!</span>
        <ul class="new-levels">
            ${printLevels()}
        </ul>
        <button class = "new-levels forward" onclick="importInputValues(this)">Finalizar Quizz</button>`;
}

function uploadUserQuizzId() {
    const userInfo =getUserQuizzes();
    userInfo.ids.push(newQuizzInfo.quizzID);
    userInfo.keys.push(newQuizzInfo.quizzKey);
    localStorage.setItem("idBuzzQuizzArray",JSON.stringify(userInfo));
}

function createSuccessfullyCreatedScreen(answer) {
    newQuizzInfo.quizzID = answer.data.id;
    newQuizzInfo.quizzKey = answer.data.key;
    stopLoading();
    uploadUserQuizzId();
    newQuizzScreen.innerHTML = `
        <span class = "title">Seu quizz está pronto!</span>
        <div class="new-quizz-layout">
            <div class="grad"></div>
            <img src="${newQuizzInfo.object.image}">
            <span>${newQuizzInfo.object.title}</span>
        </div>
        <button class = "forward" onclick="playQuizz(newQuizzInfo.quizzID)">Acessar Quizz</button>
        <button class="return-homescreen" onclick="switchPage('quizz-list')">Voltar para home</button>`;
}

function moveToNextScreen() {
    if (newQuizzScreen.querySelector(".basic-info")) {
        saveImportedBasicInfoValues();
        createNewQuestionsScreen();
    } else if (newQuizzScreen.querySelector(".new-questions")) {
        saveImportedNewQuestionsValues();
        createNewLevelsScreen();
    }else if (newQuizzScreen.querySelector(".new-levels")) {
        saveImportedNewLevelsValues();
        let quizzPromise;
        if(activeQuizz.title) {
            quizzPromise = axios.put(
                URL_QUIZZ + `/${activeQuizz.id}`, 
                newQuizzInfo.object, 
                {headers: 
                    {"Secret-Key": String(activeQuizz.key)}
                });
        } else {
            quizzPromise = axios.post(URL_QUIZZ,newQuizzInfo.object);
        }

        quizzPromise.then(createSuccessfullyCreatedScreen);
        quizzPromise.catch(uploadError);
        startLoading();
    }
}

function uploadError() {
    stopLoading();
    alert("Oh não! Parece que houve um erro :/ Nós sentimos muito! Por favor, tente novamente...");
    switchPage("quizz-list")
}

function displayError () {
    const inputs = newQuizzScreen.querySelectorAll("input, textarea");
    const spans = newQuizzScreen.querySelectorAll(".error");
    for (let i = 0; i < inputsValidation.activeInputs.length; i++) {
        for (let j = 0; (j < inputsValidation.validInputs.length || j === 0); j++) {
            if (inputsValidation.activeInputs[i] !== inputsValidation.validInputs[j]) {
                inputs[i].classList.add("input-error");
                spans[i].classList.remove("hidden");
            } else {
                inputs[i].classList.remove("input-error");
                spans[i].classList.add("hidden");
                break;
            }
        }
    }
}

function checkValidationAllInputs() {
    if (inputsValidation.totalAttempts === inputsValidation.attemptsCounter) {
        if (inputsValidation.activeInputs.length === inputsValidation.validInputs.length) {
            moveToNextScreen();
        } else {
            buttonDisableSwitch();
            displayError();
        }
    }
}

function validateSingleInput(element,index,array) {
    const inputValue = element.value;
    const inputsValidationConditions = [
        {name: "quizz-title", condition: (inputValue.length >= 20 && inputValue.length <= 65)},
        {name: "number-of-questions", condition: (!isNaN(Number(inputValue)) && Number(inputValue) >= 3)},
        {name: "number-of-levels", condition: (!isNaN(Number(inputValue)) && Number(inputValue) >= 2)},
        {name: "question-title", condition: (inputValue.length >= 20)},
        {name: "question-background-color", condition: true},
        {name: "question-answer", condition: (inputValue.value !== "")},
        {name: "level-title", condition: (inputValue.length >= 10)},
        {name: "level-description", condition: (inputValue.length >= 30)},
    ]
    const condition = inputsValidationConditions.find( ({ name }) => name === element.name ).condition;
    return condition;
}

function validateImageURL(element) {
    const UrlCheck = new Image();
    const imageUrl = element.value;
    UrlCheck.addEventListener('load',  function() {
        inputsValidation.attemptsCounter += 1;
        inputsValidation.validInputs.push(element);
        checkValidationAllInputs();
    });
    UrlCheck.addEventListener('error', function() {
        inputsValidation.attemptsCounter += 1;
        checkValidationAllInputs();
    });
    UrlCheck.src = imageUrl;
}

function isValidEmptyAnswer(element,i,array) {
    const isValidEmptyAnswer = ((i % 10 >=6) && element.value === "" && (i !== array.length-1) && array[i+1].name === "image-url" && array[i+1].value === ""); 
    const isValidEmptyUrl = ((i % 10 >=6) && element.value === "" && (i !== 0) && array[i-1].name === "question-answer" && array[i-1].value === ""); ;
    return (isValidEmptyAnswer || isValidEmptyUrl)
}

function isMinimumValuesValid(element,index,array) {
    const inputValues = array.map((input) => Number(input.value));
    const duplicatedValues = inputValues.filter((value, i) => inputValues.indexOf(value) !== i);
    const isDuplicated = duplicatedValues.includes(Number(element.value))
    const isSingleValid =  (!isNaN(Number(element.value)) && Number(element.value) >= 0 && Number(element.value) <= 100);
    return inputValues.includes(0) && !isDuplicated && isSingleValid;
}

function stageValidation(array, validationFunction) {
    const validActiveInputs = array.filter((element,index,array) => validationFunction(element,index,array));
    inputsValidation.validInputs.push(...validActiveInputs);
}

function checkInputsValidation() {
    inputsValidation.attemptsCounter = 0;
    inputsValidation.validInputs = [];
    const minPercentagesInputs = inputsValidation.activeInputs.filter( ({ name,value }) => name === "minimum-percentage" && value !== "");
    const nonEmptyImageUrlInputs = inputsValidation.activeInputs.filter( ({ name, value }) => name === "image-url" && value !== "");
    const everyOtherInput = inputsValidation.activeInputs.filter(element => !minPercentagesInputs.includes(element) && !nonEmptyImageUrlInputs.includes(element) && element.value !== "");
    inputsValidation.totalAttempts = nonEmptyImageUrlInputs.length;

    stageValidation(inputsValidation.activeInputs, isValidEmptyAnswer);
    stageValidation(minPercentagesInputs, isMinimumValuesValid);
    stageValidation(everyOtherInput, validateSingleInput);

    nonEmptyImageUrlInputs.forEach(element => validateImageURL(element))

    checkValidationAllInputs();
}

function saveImportedBasicInfoValues() {
    inputsValidation.activeInputs = Array.from(newQuizzScreen.querySelectorAll("input"));
    newQuizzInfo.object.title = inputsValidation.activeInputs[0].value;
    newQuizzInfo.object.image = inputsValidation.activeInputs[1].value;
    newQuizzInfo.numberOfQuestions = Number( inputsValidation.activeInputs[2].value);
    newQuizzInfo.numberOfLevels = Number( inputsValidation.activeInputs[3].value);
}

function saveImportedNewQuestionsValues() {
    for (let i = 0 ; i < newQuizzInfo.numberOfQuestions ; i++) {
        const thisQuestion = newQuizzScreen.querySelector(`li:nth-of-type(${i+1})`) ;
        const questionInputs = Array.from(thisQuestion.querySelectorAll("input"));
        newQuizzInfo.object.questions[i] = {
            title: questionInputs[0].value,
            color:questionInputs[1].value,
            answers:[]
        };
        for (let j = 0 ; j < 4 ; j++) {
            const text = questionInputs[(j*2)+2].value;
            const image = questionInputs[(j*2)+3].value;
            if (j < 2 || text !== "" || image !== "") {
                answerObject = {
                    text,
                    image,
                    isCorrectAnswer: false
                }
                if (j === 0) {
                    answerObject.isCorrectAnswer = true;
                }
                newQuizzInfo.object.questions[i].answers.push(answerObject);
            }
        }
    }
}

function saveImportedNewLevelsValues() {
    for (let i = 0 ; i < newQuizzInfo.numberOfLevels ; i++) {
        const thisLevel = newQuizzScreen.querySelector(`li:nth-of-type(${i+1})`) ;
        const levelInputs = Array.from(thisLevel.querySelectorAll("input, textarea"));
        newQuizzInfo.object.levels[i] = {
            title: levelInputs[0].value,
            minValue: Number(levelInputs[1].value),
			image: levelInputs[2].value,
			text: levelInputs[3].value
        };
    }
}

function importInputValues(thisButton) {
    animateButton(thisButton);
    buttonDisableSwitch();
    inputsValidation.activeInputs = Array.from(newQuizzScreen.querySelectorAll("input, textarea"));
    checkInputsValidation();
}

function deleteValue (array, value) {
    for (let i = 0; i < array.length; i++) {
        if(array[i] === value) {
            array.splice(i, 1);
        }
    }
    return array;
}

function deleteUserQuizz(id, key) {
    window.event.cancelBubble = "true";
    if(window.confirm("Você realmente quer deletar o quizz?")) {
        const promise = axios.delete(URL_QUIZZ + "/" + String(id), {
            headers: {
                "Secret-Key": String(key)
            }
        });
        const storage = JSON.parse(localStorage.getItem("idBuzzQuizzArray"));
        storage.ids = deleteValue(storage.ids, id);
        storage.keys = deleteValue(storage.keys, key);
        localStorage.setItem("idBuzzQuizzArray",JSON.stringify(storage));
        promise.then(getServerQuizzes);
    }
}

getServerQuizzes();