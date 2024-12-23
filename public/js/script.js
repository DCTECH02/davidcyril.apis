function submitForm() {
    var inputText = document.getElementById("myInput").value;
    var formAction = "/checkapikey?apikey=" + encodeURIComponent(inputText);
    document.getElementById("myForm").action = formAction;
    document.getElementById("myForm").submit();
}

function submitForm2() {
    var inputText = document.getElementById("Delete").value;
    var formAction = "/deletekey?key=" + encodeURIComponent(inputText);
    document.getElementById("myForm").action = formAction;
    document.getElementById("myForm").submit();
}