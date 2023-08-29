const Job = require('../models/jobs.schema.js')
const Users=require('../models/User.schema.js')
const path = require('path');
const pdf = require('pdf-parse');
const fs = require('fs');

const select=async function(req,res){
    const jobs=await Job.find();
    if(req.body.filterJob=="true"){
        var companies=[];
        jobs.forEach(job=>{
           if(job.Name.includes(req.body.job)){
            companies.push(job.Company);
           }
        })
        console.log(companies);
        res.send(companies);
    }
    else {
        var Jobs=[];
        jobs.forEach(job=>{
           if(job.Company.includes(req.body.company)){
            Jobs.push(job.Name);
           }
        })
        console.log(Jobs);
        res.send(Jobs);
    }
}

const filter=async function(req,res){
    const jobs=await Job.find();
    const users=await Users.find()
    var jobid="";
    var chosenJob="";
    jobs.forEach(job=>{
        if(job.Name.includes(req.body.job) && job.Company.includes(req.body.company)){
            jobid=job._id;
            chosenJob=job;
        }
    })
    console.log("jobid:  "+jobid);
    const sortedData =await Promise.all(users.map(async user => {
        if(user.Appliedjobs.includes(jobid)){
            const fileName=user.email.substring(0, user.email.indexOf("@"));
            const filePath = `public/uploads/${fileName} resume.pdf`; 
            const dataBuffer = await pdf(fs.readFileSync(filePath));
            const pdfText = dataBuffer.text;
            const words = pdfText.toLowerCase().split(/\s+/);


            const keywords=chosenJob.Skills;
            const matchingCount = keywords.reduce((total,sentence ) => {
                return total + calculateMatchingWordCount(sentence, words);
            }, 0);
            if(matchingCount!=0){
                return { user, matchingCount };
            }
        }
        }));
      

        const filteredSortedData = sortedData.filter(data => data);
        filteredSortedData.sort((a, b) => b.matchingCount - a.matchingCount);
        res.render("dashboard",{jobs:jobs,sortedData:filteredSortedData,job:chosenJob.Name,company:chosenJob.Company});
            
}
    


function calculateMatchingWordCount(sentence, words) {
    const sentenceWords = sentence.toLowerCase().split(/\s+/);
   const matchingCount = sentenceWords.filter(word => words.includes(word)).length;
   return matchingCount;
}

module.exports={select,filter}