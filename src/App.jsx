import { useState, useEffect, useCallback, useMemo } from "react";

// Issue 1: Inline API key (security issue)

function App() {
  // Issue 2: State management bisa lebih baik
  const [todos, setTodos] = useState([]);
  const [input, setInput] = useState("");
  const [filter, setFilter] = useState("all");

  // Issue 3: useEffect tanpa dependency array yang tepat
  useEffect(() => {
    // Load from localStorage
    const saved = localStorage.getItem("todos");
    if (saved) {
      try {
        setTodos(JSON.parse(saved));
      } catch {
        // Abaikan data rusak agar aplikasi tetap bisa dipakai
        localStorage.removeItem("todos");
      }
    }
  }, []);

  // Issue 4: useEffect yang terlalu sering run
  useEffect(() => {
    localStorage.setItem("todos", JSON.stringify(todos));
  }, [todos]);

  // Issue 5: Function yang tidak di-memoize, re-create setiap render
  const addTodo = useCallback(() => {
    if (input.trim() === "") {
      alert("Please enter a todo");
      return;
    }

    // Issue 6: Menggunakan Date.now() sebagai ID (bisa collision)
    const newTodo = {
      id: Date.now(),
      text: input,
      completed: false,
      createdAt: new Date().toISOString(),
    };

    setTodos([...todos, newTodo]);
    setInput("");
  }, [input, todos]);

  // Issue 7: Tidak ada error handling
  const deleteTodo = useCallback(
    (id) => {
      setTodos(todos.filter((todo) => todo.id !== id));
    },
    [todos],
  );

  const toggleTodo = useCallback(
    (id) => {
      setTodos(
        todos.map((todo) =>
          todo.id === id ? { ...todo, completed: !todo.completed } : todo,
        ),
      );
    },
    [todos],
  );

  // Issue 8: Logic filtering yang bisa dipindah ke useMemo
  const filteredTodos = useMemo(() => {
    if (filter === "active") {
      return todos.filter((todo) => !todo.completed);
    }
    if (filter === "completed") {
      return todos.filter((todo) => todo.completed);
    }
    return todos;
  }, [todos, filter]);

  // Issue 9: Calculation yang tidak perlu di setiap render
  const stats = useMemo(
    () => ({
      total: todos.length,
      completed: todos.filter((t) => t.completed).length,
      active: todos.filter((t) => !t.completed).length,
    }),
    [todos],
  );

  const handleFilterAll = useCallback(() => setFilter("all"), []);
  const handleFilterActive = useCallback(() => setFilter("active"), []);
  const handleFilterCompleted = useCallback(() => setFilter("completed"), []);

  // Issue 10: Inline event handler dengan arrow function (re-create setiap render)
  return (
    <div className="app">
      <h1>My Todo List</h1>

      {/* Issue 11: Tambahkan label agar input punya nama yang jelas untuk screen reader */}
      <div className="input-section">
        <label htmlFor="todo-input">New todo</label>
        <input
          id="todo-input"
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              addTodo();
            }
          }}
          placeholder="What needs to be done?"
        />
        <button onClick={addTodo}>Add</button>
      </div>

      {/* Issue 12: Inline styles (inconsistent dengan CSS file) */}
      <div style={{ marginBottom: "20px", display: "flex", gap: "10px" }}>
        <button
          onClick={handleFilterAll}
          style={{ background: filter === "all" ? "#28a745" : "#007bff" }}
        >
          All
        </button>
        <button
          onClick={handleFilterActive}
          style={{ background: filter === "active" ? "#28a745" : "#007bff" }}
        >
          Active
        </button>
        <button
          onClick={handleFilterCompleted}
          style={{ background: filter === "completed" ? "#28a745" : "#007bff" }}
        >
          Completed
        </button>
      </div>

      <div className="todo-list">
        {/* Issue 13: Tidak ada handling untuk empty state */}
        {filteredTodos.map((todo) => (
          // Issue 14: Key menggunakan index bisa lebih baik dengan ID
          <div
            key={todo.id}
            className={`todo-item ${todo.completed ? "completed" : ""}`}
          >
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => toggleTodo(todo.id)}
            />
            {/* Issue 15: Render teks biasa supaya input user tidak dieksekusi sebagai HTML */}
            <span>{todo.text}</span>
            <button className="delete-btn" onClick={() => deleteTodo(todo.id)}>
              Delete
            </button>
          </div>
        ))}
      </div>

      <div className="stats">
        <p>
          Total: {stats.total} | Active: {stats.active} | Completed:{" "}
          {stats.completed}
        </p>
      </div>

      {/* Issue 16: Debug code yang tertinggal dihapus supaya tidak mengganggu output */}
    </div>
  );
}

export default App;
