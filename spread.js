require('fs').unlinkSync('out.log')

const diseaseName = 'SARS-COVID-19'
const infectionRate = 14.285714285714285 //%chance of infecting another person per day
const earthPopulation = 9000000000
const dateOfFirstCase = new Date('12/01/2019');
const chanceOfDeath = 0.14 //per cent value per day
const averageLengthOfInfection = 14 //in days

class InfectedPerson{
    constructor(infector){
        this.alive = true;
        this.numberOfDaysInfected = 0;
        this.numberOfPeopleInfected = 0
        this.patientNumber = totalInfected.length;
        this.patientsInfected = []; //by patientNumber
        this.infectedDate = currentDate.toString()
        this.infectedBy = infector
    }

    infect(infectedPersonID){
        this.patientsInfected.push(infectedPersonID)
        this.numberOfPeopleInfected++
    }
}

let currentDate = dateOfFirstCase;
let totalInfected = [];
let currentlyInfected = [];
let recovered = [];
let dead = [];

let patientZero = new InfectedPerson();

totalInfected.push(patientZero)
currentlyInfected.push(patientZero)

function isPatientStillInfected(infectedPerson){
    if(infectedPerson.numberOfDaysInfected >= averageLengthOfInfection){
        return false;
    }else{
        return true;
    }
}

function infectOthers(infectedPerson){
    let result = Math.random() * 100
    if(result <= infectionRate){
        let newInfected = new InfectedPerson(infectedPerson.patientNumber);
        infectedPerson.infect(newInfected.patientNumber);
        currentlyInfected.push(newInfected);
        totalInfected.push(newInfected);
    } 
}

function dieOrNot(i){
    let result = Math.random() * 100
    if(result <= chanceOfDeath){
        let deadPerson = currentlyInfected.splice(i,1)
        deadPerson.alive = false;
        dead.push(deadPerson);
        i--
    } 
}
function report(){
    
    let output = ""+
    '\nDisease name: '+diseaseName+
    '\nCurrent date: '+currentDate+
    '\nTotal number of people infected: '+ totalInfected.length+
    '\ncurrent number of people infected:' + currentlyInfected.length+
    '\nTotal recovered: '+recovered.length+
    '\ntotal casualties: '+dead.length+
    '\n'
    require('fs').appendFileSync('out.log',output,'utf-8');
    console.clear();
    console.log(output)
}

while(totalInfected.length < earthPopulation){
    for(let i=0;i<currentlyInfected.length;i++){
        let infectedPerson = currentlyInfected[i]
        let isStillInfected = isPatientStillInfected(infectedPerson)
        if(isStillInfected){
            infectOthers(infectedPerson);
            dieOrNot(i);
            infectedPerson.numberOfDaysInfected++
        }else{
            let recoveredPerson = currentlyInfected.splice(i,1);
            recovered.push(recoveredPerson);
            i--;
        }
    }
    report();
    currentDate = new Date(currentDate.getTime() + 86400000);
}

