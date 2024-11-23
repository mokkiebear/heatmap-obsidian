
```dataviewjs

function getInitialData() {
	// Today's date
	const today = new Date(2024, 10, 23); 
	// Number of days to subtract
	const daysToSubtract = 729;
	
	// Calculate start date
	const startDate = new Date(today);
	startDate.setDate(today.getDate() - daysToSubtract);
	
	// Generate dates grouped by year
	const datesByYear = [];
	let currentDate = new Date(startDate);
	
	while (currentDate <= today) {
	  const year = currentDate.getFullYear();
	  
	  // Add the date in YYYY-MM-DD format
	  datesByYear.push(
	    currentDate.toISOString().split("T")[0] // Format date as YYYY-MM-DD
	  );
	
	  // Move to the next day
	  currentDate.setDate(currentDate.getDate() + 1);
	}
	
	return datesByYear;
}


dv.span("** 🗄️ Example: If you need to prefill your data 🗄️ **")

const trackerData = {
      year: 2024,
      entries: Object.values(getInitialData()).map((date) => ({
          date,
          content: ''
      }))
      
    };


renderHeatmapTracker(this.container, trackerData)

```

```dataviewjs

const trackerData = {
    year: 2024,
    intensityScaleEnd: 45 * 60 * 1000, //convert 45 minutes to millis
    colors: {
        red: ["#ff9e82","#ff7b55","#ff4d1a","#e73400","#bd2a00",
        "hsl(132, 90%, 40%)"] //last one green
    },
    entries: [],
    separateMonths: true
}

for(let page of dv.pages('"daily notes"').where(p=>p.exercise)){
    trackerData.entries.push({
        date: page.file.name,
        intensity: page.exercise,
        content: await dv.span(`[](${page.file.name})`)
    });
}

dv.paragraph("**🏋️ Exercises 🏋️**");
dv.paragraph("**Green** - if you achieved your exercises goal (45 minutes in this example)");
dv.paragraph("**separateMonths: true** - to add padding between months");

renderHeatmapTracker(this.container, trackerData);
```

```dataviewjs

dv.span("** 👣 Steps 👣 **")

const trackerData = {
    year: 2024, // optional, remove this line to autoswitch year
    entries: [],
}

 
for(let page of dv.pages('"daily notes"').where(p=>p.steps)){

    trackerData.entries.push({
        date: page.file.name,
        intensity: page.steps
    })  
}

renderHeatmapTracker(this.container, trackerData)

```
```dataviewjs

dv.span("** 👣 Steps 👣 ** (11 intensities instead of 5)")

const trackerData = {
    year: 2024, // optional, remove this line to autoswitch year
    entries: [],
    colors: {
        oldGithubGreen11:[
            "hsl(65, 83%, 88%)",
            "hsl(70, 77%, 78%)",
            "hsl(80, 62%, 72%)",
            "hsl(95, 52%, 66%)",
            "hsl(112, 45%, 61%)",
            "hsl(125, 43%, 56%)",
            "hsl(132, 41%, 49%)",
            "hsl(132, 45%, 43%)",
            "hsl(132, 49%, 36%)",
            "hsl(132, 54%, 29%)", 
            "hsl(132, 59%, 24%)",
        ]
    },
}

 
for(let page of dv.pages('"daily notes"').where(p=>p.steps)){

    trackerData.entries.push({
        date: page.file.name,
        intensity: page.steps
    })  
}

renderHeatmapTracker(this.container, trackerData)

```
```dataviewjs

dv.span("** 👣 Steps 👣 ** (custom scale from 1000 to 10000)")

const trackerData = {
    year: 2024, // optional, remove this line to autoswitch year
    entries: [],
    intensityScaleStart: 1000,
    intensityScaleEnd: 10000
}

 
for(let page of dv.pages('"daily notes"').where(p=>p.steps)){

    trackerData.entries.push({
        date: page.file.name,
        intensity: page.steps
    })  
}

renderHeatmapTracker(this.container, trackerData)

```
```dataviewjs

dv.span("** 👣 Steps 👣 ** (11 intensities + scale from 2000)")

const trackerData = {
    year: 2022, // optional, remove this line to autoswitch year
    entries: [],
    intensityScaleStart: 2000,
    colors: {
        oldGithubGreen11:[
            "hsl(65, 83%, 88%)","hsl(70, 77%, 78%)",
            "hsl(80, 62%, 72%)","hsl(95, 52%, 66%)",
            "hsl(112, 45%, 61%)","hsl(125, 43%, 56%)",
            "hsl(132, 41%, 49%)","hsl(132, 45%, 43%)",
            "hsl(132, 49%, 36%)","hsl(132, 54%, 29%)", 
            "hsl(132, 59%, 24%)",
        ]
    },
}

 
for(let page of dv.pages('"daily notes"').where(p=>p.steps)){

    trackerData.entries.push({
        date: page.file.name,
        intensity: page.steps
    })  
}

renderHeatmapTracker(this.container, trackerData)

```

```dataviewjs

dv.span("** Learning **")

const trackerData = {
    year: 2024,
    colors: {
        blue: ["#ffdf04","#ffbe04","#ff9a03","#ff6d02","#ff2c01"]
    },
    entries: [],
    showCurrentDayBorder: false
}

for(let page of dv.pages('"daily notes"').where(p=>p.learning)){
    trackerData.entries.push({
        date: page.file.name,
        intensity: page.learning
    })  
}

renderHeatmapTracker(this.container, trackerData)

```
```dataviewjs

dv.span("** learning ** (everything over 8 is full intensity red)")

const trackerData = {
    year: 2022,
    colors: {
        blue: ["#ffdf04","#ffbe04","#ff9a03","#ff6d02","#ff2c01"]
    },
    entries: [],
    showCurrentDayBorder: false,
    intensityScaleEnd: 8,
}

for(let page of dv.pages('"daily notes"').where(p=>p.learning)){
	//dv.paragraph(page.file.name + " learning: " + page.learning)
    
    trackerData.entries.push({
        date: page.file.name,
        intensity: page.learning
    })  
}

renderHeatmapTracker(this.container, trackerData)

```

```dataviewjs

dv.span("**🔗 learning **- Dont break the chain! 🔗🔗🔗🔗")

const trackerData = {
    year: 2022,
    colors: {
        transparent: ["transparent"],
    },
    entries: []
}

for(let page of dv.pages('"daily notes"').where(p=>p.learning)){
	 
    trackerData.entries.push({
        date: page.file.name,
        intensity: 4,
        content: "🔗"
    })   
}

//console.log(trackerData)
	
renderHeatmapTracker(this.container, trackerData)

```


### Quick Guide 
- Install **"Dataview"** and **"Heatmap Tracker"** from the community plugins page.
- Enable **Settings** -> **Dataview** -> **Enable Javascript Queries**

**Hover Preview**
- Enable **Settings** -> **Core Plugins** -> **Page Preview** for hover preview to work.
- install **Community plugins** -> **Metatable** in order to preview frontmatter aswell.


## For testing
```dataviewjs

dv.span("**test intensities 0to5**")
const heat = ["#1C0298","#2500D9","#6F04D7","#C911CF","#FD06B2","#FD5C81","#FD7A48","#FD9A75","#FDD276","#FCE4B2"]

let trackerData = {
    year: 2022,
    colors: {
        red: heat
    },
    entries: []
}

for(let page of dv.pages('"daily notes"').where(p=>p.intensity0to5)){
    trackerData.entries.push({
        date: page.file.name,
        intensity: page.intensity0to5
    })
       
}

renderHeatmapTracker(this.container, trackerData)


dv.span("**test intensities 0to5ish**")

trackerData = {
    year: 2022,
    colors: {
        red: heat
    },
    entries: []
}

for(let page of dv.pages('"daily notes"').where(p=>p.intensity0to5ish)){
    trackerData.entries.push({
        date: page.file.name,
        intensity: page.intensity0to5ish
    })
       
}

renderHeatmapTracker(this.container, trackerData)



dv.span("**test intensities 0to10**")

trackerData = {
    year: 2022,
    colors: {
        red: heat
    },
    entries: []
}

for(let page of dv.pages('"daily notes"').where(p=>p.intensity0to10)){
    trackerData.entries.push({
        date: page.file.name,
        intensity: page.intensity0to10
    })
       
}

renderHeatmapTracker(this.container, trackerData)


dv.span("**test intensities 0to25**")

trackerData = {
    year: 2022,
    colors: {
        red: heat
    },
    entries: []
}

for(let page of dv.pages('"daily notes"').where(p=>p.intensity0to25)){
    trackerData.entries.push({
        date: page.file.name,
        intensity: page.intensity0to25
    })
       
}

renderHeatmapTracker(this.container, trackerData)


dv.span("**test intensities 0to25 + scale end 15**")

trackerData = {
    year: 2022,
    intensityScaleEnd: 15,
    colors: {
        red: heat
    },
    entries: []
}

for(let page of dv.pages('"daily notes"').where(p=>p.intensity0to25)){
    trackerData.entries.push({
        date: page.file.name,
        intensity: page.intensity0to25
    })
       
}

renderHeatmapTracker(this.container, trackerData)

```
