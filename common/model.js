function predict(x, model, commands) {
	if (!(x instanceof tf.Tensor)) {
		x = tf.tensor(x);
	}
	let input_shape = model.config['input_shape'].slice();
	input_shape.unshift(-1);

	let output = model.predict(x.reshape(input_shape)).dataSync();

	printData("output", output)
	//
	// maxProb = output.max(axis = 1).dataSync()[0];
	// let index = commands.indexOf("unknown");
	// if (maxProb > predictionThreshold) {
	// 	index = output.argMax(axis).dataSync()[0];
	// }

	let index = commands.indexOf("unknown");
  let max_prob = 0;
  for (let i = 0; i < commands.length; i++) {
    if (output[i] > max_prob) {
      index = i;
      max_prob = output[i];
    }
  }
  console.log(commands[index]);

	return commands[index];
}
