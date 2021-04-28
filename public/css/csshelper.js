const sliders = document.getElementsByClassName("slider");

for (const s of sliders) {
    s.style.background = "linear-gradient(to right, #3a3a3a 50%, #5298b9 50%)"

    s.oninput = () => {
        let percent = (s.value - s.min) / (s.max - s.min) * 100; // get percent based on value, min and max
        s.style.background = "linear-gradient(to right, #3a3a3a " + percent + "%, #5298b9 " + percent + "%)";
        s.previousElementSibling.lastChild.innerHTML = ": " + s.value;
    }
}

const varEqs = document.getElementsByClassName("eq");

for (const o of varEqs){
    o.innerHTML = o.innerHTML.replace(/\s/g, "&nbsp");
}

