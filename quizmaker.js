var answerOne = document.getElementById("question").textContent


const saveInputs = () =>{
    document.getElementById("question").innerHTML = ""
}





document.getElementById("save_button").addEventListener("click", saveInputs)

//michael this is some test code it doesn't really work because the event listener clears out all input fields 
//but i was just thinking of storing the inputs in like a variable after save button is hit
// then it gets transfered to the game somehow for the questions and answers
//have fun