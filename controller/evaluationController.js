let names = ["brandon", "jay", "jack", "max"];
let dataSets = [brandonDataset, jayDataset, jackDataset, maxDataset];

let dataSizes = ["1", "3", "5"];

let records = {
    "1" : [],
    "3" : [],
    "5" : [],
};

function formatSummary(targetDataSize) {
    let elmt = records[targetDataSize];
    var sum = 0;
    for( var i = 0; i < elmt.length; i++) {
        sum += parseFloat(elmt[i]); //don't forget to add the base
    }

    var avg = 0;

    if (elmt.length > 0) {
        avg = (sum/elmt.length).toFixed(2);
    }

    return targetDataSize + " - COUNT : " + elmt.length + ", AVG : " + avg + " mins";

}

function updateSummary(result) {
    records[dataSize].push(result.trainingTime)
    let text = '';

    for (var i = 0; i < dataSizes.length; i++) {
        text += formatSummary(dataSizes[i]) + '<br>'
        text += JSON.stringify(records[dataSizes[i]]) + '<br>';
    }


    $('#summary').html('< SUMMARY ><br>' + text);
}

let mfccDeferred = null;
let rawAudioData = null;
let processedDataIndex = null;
let processedData = null;

function computeMFCC() {
    if (processedData.length < rawAudioData.length) {
        let i = processedData.length;
        $('#progress').html(baseStatusMsg + "MFCC computation " + (i+1) + " / " + rawAudioData.length);
        let offlineProcessor = new OfflineAudioProcessor(audioConfig, rawAudioData[i]);
        offlineProcessor.getMFCC().done(function(mfccData) {
            processedData.push(mfccData);
            computeMFCC();
        })
    } else {
        mfccDeferred.resolve();
    }
}

let maxExperiment = 10;
let expIndex = null;
let dataSetIndex = null;
let dataSizeIndex = null;

let baseStatusMsg = null;
let name = null;
let dataSize = null;
let dataSet = null;

function startEvaluation() {
    if (dataSizeIndex == dataSizes.length) {
        dataSizeIndex = 0;
        dataSetIndex++;
    }
    if (dataSetIndex == dataSets.length) {
        dataSetIndex = 0;
        expIndex++;
    }
    if (expIndex < maxExperiment) {
        name = names[dataSetIndex];
        dataSize = dataSizes[dataSizeIndex];
        dataSet = dataSets[dataSetIndex];

        if (typeof(Storage) !== "undefined") {
            localStorage.removeItem("personalized");
        }

        baseStatusMsg = "< Exp " + (expIndex + 1) + " - " + name + " : " + dataSize + " ><br>";
        rawAudioData = dataSet[dataSize]["data"];

        processedData = [];
        mfccDeferred = $.Deferred();

        mfccDeferred.promise().done(function() {
            $('#progress').html(baseStatusMsg);
            
            let labels = dataSet[dataSize]["label"];
            let model = new SpeechResModel("RES8_NARROW", commands);
            model.train(processedData, labels, $('#statusBar')).then(function(result) {
                updateSummary(result);
                dataSizeIndex++;
                startEvaluation();
            });
        })
        computeMFCC();
    } else {
        $('#progress').html('evaluation is completed');
        $('#startBtn').show();
    }
}

$('#startBtn').click(function() {
    $('#startBtn').hide();
    expIndex = 0;
    dataSetIndex = 0;
    dataSizeIndex = 0;
    startEvaluation();
});
