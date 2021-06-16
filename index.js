const express = require("express");
const bodyParser = require("body-parser");
const TelegramBot = require("node-telegram-bot-api");
const fs = require("fs");
const token = process.env.token; 
const app = express();
const rawdata = fs.readFileSync("students.json", "utf8");
const students = JSON.parse(rawdata);

if (process.env.NODE_ENV === "production") {
	bot = new TelegramBot(token);
	bot.setWebHook(process.env.HEROKU_URL + bot.token);
} else {
	bot = new TelegramBot(token, { polling: true });
}

bot.onText(/(\d{6})/, (msg, match) => {
	let chatid = msg.chat.id;
	let admission = parseInt(match[0]);
	let student = search_student(admission);
	if (student) {
		const students_same_university = find_same_unvesity(student);

		bot.sendMessage(
			chatid,
			format_output(student, students_same_university),
			{ parse_mode: "Markdown" }
		);
	} else {
		bot.sendMessage(
			chatid,
			"Sorry, The Student is Failed the Entrance Exam "
		);
	}
});

bot.on("polling_error", (err) => {
	console.log(err);
});

bot.onText(/\/start/, (msg, match) => {
	let chatid = msg.chat.id;
	let output = `
        *WELCOME TO PLACEMENT VIEWER*
            _FOR EJERE STUDENTES_
        
            Developed By: [@naol_chala](@naol_chala)
            
    Enter Your Admission Number(*139152* - *139303*)

    `;

	bot.sendMessage(chatid, output, { parse_mode: "Markdown" });
});

const search_student = (id) => {
	for (let student of students) {
		if (student.stid === id) {
			return student;
		}
	}

	return undefined;
};

const find_same_unvesity = (thisStudent) => {
	const same_students = [];
	for (let student of students) {
		if (student.Placement === thisStudent.Placement) {
			same_students.push(student);
		}
	}
	return same_students;
};

const format_output = (student, sameUniversity) => {
	let output = `
👨‍🎓  Name: ${student.Name}
💳  ID: ${student.stid}
🏫  Placement: *${student.Placement}*

[@ejereplacement2013_bot](@ejereplacement2013_bot)

Students From Ejere placed into *${student.Placement}*:
`;
	for (let std of sameUniversity) {
		output += `
👤  ${std.Name} --  *${std.stid}*
`;
	}

	output += `

      Total Students From Ejere = ${sameUniversity.length}

[@ejereplacement2013_bot](@ejereplacement2013_bot)

    `;

	return output;
};

app.use(bodyParser.json());

app.listen(process.env.PORT);

app.post("/" + bot.token, (req, res) => {
	bot.processUpdate(req.body);
	res.sendStatus(200);
});
