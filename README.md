# appzeni-dev.github.io
# Question Bank, But Good.

A modern, interactive web app for managing, browsing, and studying Digital Society exam questions. Built for IB Digital Society students.

First attempt at coding with Copilot. I know the architecture is messy, but everything works (kind of).

## Features
- **Question Bank Management:** Upload, validate, and store your question bank JSON file in localStorage via the Manage page.
- **Browse & Search:** Filter and explore questions by source, author, paper, tags, command terms, and more.
- **Quiz & Study:** Generate custom or random quizzes, save responses, and review past quizzes.
- **Exam Details:** View all questions for a given exam, with meta info and answer reveal.
- **Dashboard:** Visualise metrics, command terms, concepts, content, and context usage.
- **Danger Zone:** Clear question bank or responses with modal confirmation.
- **Theme Toggle:** Switch between light and dark modes for accessibility.

## File Structure
```
index.html                # Main dashboard/homepage
manage.html               # Manage question bank (upload, clear, danger zone)
browse.html               # Browse/search questions
papers.html               # List of papers
study.html                # Quiz/study generator
exam-details.html         # Exam details and question view
css/styles.css            # Custom styles
js/
  manage.js               # Manage page logic
  browse.js               # Browse/search logic
  papers.js               # Papers page logic
  study.js                # Quiz/study logic
  quiz.js                 # Quiz page logic
  exam-details.js         # Exam details logic
  dashboard.js            # Dashboard metrics logic
  theme-toggle.js         # Theme toggle logic
images/                   # Icons and images
```

## Usage
1. **Upload Question Bank:**
   - Go to `manage.html` and upload a valid Digital Society question bank JSON file.
   - The app validates structure and saves to browser localStorage.
2. **Browse & Study:**
   - Use navigation links to browse, study, or view exam details.
   - Generate quizzes and save responses; all data is stored locally.
3. **Danger Zone:**
   - Use Manage page to clear question bank or responses (with confirmation).

## Data Format

The question bank JSON must be an array of objects. Each object typically includes:

```json
{
   "ID": 1,
   "Source": "2024 DP1 T1 Practice Paper 1",
   "Author": "Teacher",
   "PublicationDate": "20240318",
   "Subject": "Digital society",
   "ExamID": 11,
   "Title": "The one secret your WebMD doesn't want you to know about!",
   "Stimulus": "Activity monitoring and health apps have become increasingly prevalent in today's digital landscape, offering individuals tools to track their physical activity, monitor health metrics, and achieve wellness goals. However, alongside their benefits, concerns have arisen regarding the privacy and security of personal health information, as well as the potential for targeted advertising and content recommendations based on users' data.",
   "PaperID": 1,
   "Section": "A",
   "Level": "SL/HL",
   "QuestionNo": "1",
   "SubQuestionNo": "a",
   "SubSubQuestionNo": "i",
   "AssessmentObjective": "AO1",
   "CommandTerm": "Identify",
   "QuestionText": "Identify two types of data that a smart watch may capture about its owner.",
   "Marks": 2,
   "AnswerText": "Possible student responses:\n- Physical activity data, such as step counts, distance travelled, or calories burned.\n- Health metrics data, including heart rate, sleep patterns, or blood oxygen levels.",
   "ConceptTags": ["values and ethics", "identity"],
   "ContentTags": ["data"],
   "ContextTags": ["health"],
   "ChallengeTags": []
}
```

## Development
- No backend required; all data is stored in browser localStorage.
- Uses Tailwind CSS for styling and Chart.js for charts.
- All logic is in modular JS files under `js/`.

## Accessibility & Theme
- Fully accessible navigation and forms.
- Theme toggle for light/dark mode.

## License
MIT License. See LICENSE file if present.

## Credits
- IB Digital Society guide (first assessment 2024).
- Icons: Font Awesome, custom SVGs.

---
For bug reports or feature requests, please open an issue or contact the maintainer.
