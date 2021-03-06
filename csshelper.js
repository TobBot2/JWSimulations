const sliders = document.getElementsByClassName("slider");

for (let s of sliders){
    s.style.background = "linear-gradient(to right, #3a3a3a 50%, #5298b9 50%)"
    s.oninput = () => {
        let x = (s.value - s.min) / (s.max - s.min) * 100; // get percent based on value, min and max
        s.style.background = "linear-gradient(to right, #3a3a3a " + x + "%, #5298b9 " + x + "%)";
    }
}