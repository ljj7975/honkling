import codecs
import json
import sys
import os
import random
import librosa
import numpy as np

data_dir = sys.argv[1]

keywords = ["silence", "unknown", "yes", "no", "up", "down", "left", "right", "on", "off", "stop", "go"]
unknown_label = keywords.index("unknown")
sample_rate = 16000
data_sizes = [1, 3, 5]

output = {}

for data_size in data_sizes:
    output[data_size] = {
        "data" : [],
        "label" : []
    }

for data_size in data_sizes:
    data = []
    labels = []
    unknowns = []
    for folder_name in os.listdir(data_dir):
        folder_path = os.path.join(data_dir, folder_name)
        samples = random.sample(os.listdir(folder_path), data_size)
        processed_samples = []
        for sample in samples:
            audio_file = os.path.join(folder_path, sample)
            audio_data = librosa.core.load(audio_file, sr=16000)[0][:sample_rate]
            audio_data = np.pad(audio_data, (0, sample_rate - len(audio_data)), 'constant')

            assert len(audio_data) == sample_rate
            processed_samples.append(audio_data.tolist())


        label = unknown_label
        if folder_name in keywords:
            label = keywords.index(folder_name)

        if label == unknown_label:
            unknowns += processed_samples
        else:
            data += processed_samples
            labels += [label] * data_size

    random.shuffle(unknowns)
    data += unknowns[:data_size]
    labels += [unknown_label] * data_size

    zipped = list(zip(data, labels))
    random.shuffle(zipped)

    output[data_size]["data"], output[data_size]["label"] = zip(*zipped)

    print(data_size, len(output[data_size]["data"]))


file_name = data_dir.split('/')[-1] + '.js'
json.dump(output, codecs.open(file_name, 'w', encoding='utf-8'), separators=(',', ':'), sort_keys=True, indent=4)
