"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { generateMCQs } from "../../utils/generateMCQ";
import { parseWordFile, extractMCQsFromText } from "../../utils/parseWordMCQ";
import styles from "./FacultyDashboard.module.scss";

export default function FacultyDashboard() {
  const router = useRouter();

  const [faculty, setFaculty] = useState<any>(null);

  const [subject, setSubject] = useState("");
  const [topic, setTopic] = useState("");
  const [description, setDescription] = useState("");
  const [numQuestions, setNumQuestions] = useState(10);
  const [aiLoading, setAiLoading] = useState(false);
  const [questions, setQuestions] = useState<any[]>([]);
  const [testDate, setTestDate] = useState("");
  const [testTime, setTestTime] = useState("");
  const [testScheduled, setTestScheduled] = useState(false);
  const [myTests, setMyTests] = useState<any[]>([]);

  useEffect(() => {

    fetch("/api/faculty/profile")
      .then(res => res.json())
      .then(data => setFaculty(data.faculty));

    fetch("/api/tests")
      .then(res => res.json())
      .then(data => {
        if (data.tests) setMyTests(data.tests);
      });

  }, [testScheduled]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout");
    router.push("/login");
  };

  const handleGenerateAIQuestions = async () => {
    setAiLoading(true);
    try {
      const mcqs = await generateMCQs({ topic, numQuestions });
      setQuestions(Array.isArray(mcqs) ? mcqs : []);
    } catch (err) {
      alert("Failed to generate MCQs");
    }
    setAiLoading(false);
  };

  const handleWordFileUpload = async (e: any) => {

    if (e.target.files && e.target.files[0]) {

      const file = e.target.files[0];

      const text = await parseWordFile(file);
      const mcqs = extractMCQsFromText(text);

      setQuestions(mcqs);
    }
  };

  const handleScheduleTest = async () => {

    if (!subject || !topic || !description || !testDate || !testTime || questions.length === 0) {
      alert("Please fill all fields");
      return;
    }

    await fetch("/api/tests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },

      body: JSON.stringify({
        subject,
        topic,
        description,
        testDate,
        testTime,
        questions,
      }),
    });

    setTestScheduled(true);
  };

  return (

    <div className={styles.dashboard}>

      <div className={styles.header}>

        <h2>Faculty Dashboard</h2>

        {faculty && (
          <div className={styles.profileBox}>

            <div className={styles.avatar}>
              {faculty.name?.charAt(0)}
            </div>

            <div className={styles.info}>
              <strong>{faculty.name}</strong>
              <span>{faculty.department}</span>
            </div>

            <button
              className={styles.logoutBtn}
              onClick={handleLogout}
            >
              Logout
            </button>

          </div>
        )}

      </div>

      <form
        className={styles.form}
        onSubmit={(e) => {
          e.preventDefault();
          handleScheduleTest();
        }}
      >

        <div>
          <label>Subject</label>
          <input value={subject} onChange={(e) => setSubject(e.target.value)} />
        </div>

        <div>
          <label>Topic</label>
          <input value={topic} onChange={(e) => setTopic(e.target.value)} />
        </div>

        <div>
          <label>Description</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>

        <div>

          <label>Number of MCQs</label>

          <div className={styles.buttonRow}>

            <select
              value={numQuestions}
              onChange={(e) => setNumQuestions(Number(e.target.value))}
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={30}>30</option>
            </select>

            <button
              type="button"
              className={styles.secondaryBtn}
              onClick={handleGenerateAIQuestions}
            >
              {aiLoading ? "Generating..." : "Generate MCQs"}
            </button>

          </div>

        </div>

        <div>
          <label>Upload Word File</label>
          <input type="file" onChange={handleWordFileUpload} />
        </div>

        <div>
          <label>Test Date</label>
          <input type="date" value={testDate} onChange={(e) => setTestDate(e.target.value)} />
        </div>

        <div>
          <label>Test Time</label>
          <input type="time" value={testTime} onChange={(e) => setTestTime(e.target.value)} />
        </div>

        <button className={styles.primaryBtn}>
          Schedule Test
        </button>

      </form>

      {questions.length > 0 && (

        <div className={styles.questionBox}>

          <h3>Questions</h3>

          <ol>

            {questions.map((q, i) => (

              <li key={i}>

                <div>{q.question}</div>

                <ul>
                  {q.options.map((opt: string, idx: number) => (
                    <li key={idx}>{opt}</li>
                  ))}
                </ul>

              </li>

            ))}

          </ol>

        </div>

      )}

      {testScheduled && (
        <div className={styles.successMsg}>
          Test Scheduled Successfully
        </div>
      )}

      <div className={styles.testList}>

        <h2>My Scheduled Tests</h2>

        {myTests.length === 0 ? (

          <div>No tests scheduled yet</div>

        ) : (

          myTests.map((test, idx) => (

            <div key={idx} className={styles.testCard}>

              <strong>{test.subject}</strong> - {test.topic}

              <div>{test.description}</div>

              <div>
                Date: {test.testDate?.slice(0,10)} | Time: {test.testTime}
              </div>

              <div>
                Questions: {test.questions?.length || 0}
              </div>

            </div>

          ))

        )}

      </div>

    </div>

  );
}