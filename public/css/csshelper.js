const sliders = document.getElementsByClassName("slider");

for (const s of sliders) {
    let percent = (s.value - s.min) / (s.max - s.min) * 100; // get percent based on value, min and max
    s.style.background = "linear-gradient(to right, #3a3a3a " + percent + "%, #5298b9 " + percent + "%)"

    s.oninput = () => {
        let percent = (s.value - s.min) / (s.max - s.min) * 100; // get percent based on value, min and max
        s.style.background = "linear-gradient(to right, #3a3a3a " + percent + "%, #5298b9 " + percent + "%)";
        //s.previousElementSibling.lastChild.innerHTML = ": " + s.value;
        s.previousElementSibling.getElementsByTagName("span")[0].innerHTML = ": " + s.value; // used so I can place units after the number
    }
}

const varEqs = document.getElementsByClassName("eq");

for (const o of varEqs){
    o.innerHTML = o.innerHTML.replace(/\s/g, "&nbsp");
}

