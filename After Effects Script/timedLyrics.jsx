function trimString(str) {
    return str.replace(/^\s+|\s+$/g, '');
}

// Function to convert time in "HH:MM:SS.mmm" or "MM:SS.mmm" to seconds
function timeToSeconds(timeString) {
    var parts = timeString.split(':');
    var secondsParts = parts[parts.length - 1].split('.');
    var seconds = parseFloat(secondsParts[0]);
    var milliseconds = parseFloat(secondsParts[1]) || 0;

    if (parts.length === 3) { // HH:MM:SS.mmm
        var hours = parseFloat(parts[0]);
        var minutes = parseFloat(parts[1]);
        return hours * 3600 + minutes * 60 + seconds + milliseconds / 1000;
    } else if (parts.length === 2) { // MM:SS.mmm
        var minutes = parseFloat(parts[0]);
        return minutes * 60 + seconds + milliseconds / 1000;
    } else if (parts.length === 1) { // SS.mmm
        return seconds + milliseconds / 1000;
    } else {
        return 0;
    }
}

// Main function to read the text file and create timed text layers
function createTimedTextFromFile(filePath) {

    var file = File(filePath || File.openDialog("Select a .txt file with timed lyrics"));

    if (file && file.exists) {
        file.open("r");
        var content = file.read();
        file.close();

        // Split file content by new lines
        var lines = content.split('\n');

        // Get the current composition
        var comp = app.project.activeItem;

        if (comp && comp instanceof CompItem) {
            app.beginUndoGroup("Create Timed Text Layers");

            // Loop through each line
            for (var i = 0; i < lines.length; i++) {
                var line = trimString(lines[i]); // custom trim function

                // Use regex to match the specific format [startTime --> endTime] Text
                var regex = /^\[(\d{2}:\d{2}.\d{3})\s*-->\s*(\d{2}:\d{2}.\d{3})\]\s*(.+)$/;
                var match = regex.exec(line);

                if (match && match.length === 4) {
                    var startTimeString = trimString(match[1]);
                    var endTimeString = trimString(match[2]);
                    var text = trimString(match[3]);

                    // Convert start and end times to seconds
                    var startTimeInSeconds = timeToSeconds(startTimeString);
                    var endTimeInSeconds = timeToSeconds(endTimeString);

                    var textLayer = comp.layers.addText(text);

                    textLayer.startTime = startTimeInSeconds;
                    textLayer.outPoint = endTimeInSeconds;

                    var textProp = textLayer.property("Source Text");
                    var textDocument = textProp.value;
                    textDocument.fontSize = 50; //  font size 
                    textDocument.fillColor = [1, 1, 1]; // text color
                    textProp.setValue(textDocument);
                }
            }

            app.endUndoGroup();
        } else {
            alert("Please select a composition in After Effects.");
        }
    } else {
        alert("File not found or not selected.");
    }
}

createTimedTextFromFile();
