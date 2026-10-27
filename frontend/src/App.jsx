
import { useEffect, useState } from 'react';
import './App.css';

const API_URL = 'https://recipe-book-hvw1.onrender.com/api/recipes';
const emptyForm = {
  name: '',
  category: 'Breakfast',
  ingredients: '',
  steps: '',
  cookingTime: ''
};

function App() {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [selectedRecipe, setSelectedRecipe] = useState(null);

  async function loadRecipes() {
    try {
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error('Could not load recipes');
      setRecipes(await response.json());
      setError('');
    } catch {
      setError('Cannot connect to the backend. Make sure it is running on port 5000.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadRecipes();
  }, []);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm(previous => ({ ...previous, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');

    try {
      const response = await fetch(
        editingId ? `${API_URL}/${editingId}` : API_URL,
        {
          method: editingId ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...form,
            cookingTime: Number(form.cookingTime)
          })
        }
      );

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Could not save recipe');

      setForm({ ...emptyForm });
      setEditingId(null);
      await loadRecipes();
      alert(editingId ? 'Recipe updated successfully!' : 'Recipe added successfully!');
    } catch (err) {
      setError(err.message);
    }
  }

  function editRecipe(recipe) {
    setForm({
      name: recipe.name,
      category: recipe.category,
      ingredients: recipe.ingredients,
      steps: recipe.steps,
      cookingTime: String(recipe.cookingTime)
    });
    setEditingId(recipe._id);
    setSelectedRecipe(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function cancelEdit() {
    setForm({ ...emptyForm });
    setEditingId(null);
    setError('');
  }

  async function deleteRecipe(id) {
    if (!window.confirm('Are you sure you want to delete this recipe?')) return;

    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE'
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Could not delete recipe');

      if (editingId === id) cancelEdit();
      if (selectedRecipe?._id === id) setSelectedRecipe(null);
      await loadRecipes();
      alert('Recipe deleted successfully!');
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="app">
      <header className="header">
        <div className="header-inner">
          <div className="brand">🍲 Recipe Book</div>
          <p>Your favourite recipes, all in one place</p>
        </div>
      </header>

      <main className="container">
        <section className="welcome">
          <h1>Discover &amp; Save Recipes</h1>
          <p>Add your favourite dishes and keep their ingredients and cooking steps ready.</p>
        </section>

        {error && <div className="error">{error}</div>}

        <div className="content-grid">
          <section className="panel">
            <h2>{editingId ? '✏️ Edit Recipe' : '➕ Add a Recipe'}</h2>

            <form onSubmit={handleSubmit}>
              <label htmlFor="name">Recipe Name</label>
              <input id="name" name="name" value={form.name} onChange={handleChange} placeholder="e.g. Vegetable Fried Rice" required />

              <label htmlFor="category">Category</label>
              <select id="category" name="category" value={form.category} onChange={handleChange}>
                {['Breakfast', 'Lunch', 'Dinner', 'Snack', 'Dessert'].map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>

              <label htmlFor="ingredients">Ingredients</label>
              <textarea id="ingredients" name="ingredients" value={form.ingredients} onChange={handleChange} placeholder="Enter ingredients, separated by commas" rows="3" required />

              <label htmlFor="steps">Preparation Steps</label>
              <textarea id="steps" name="steps" value={form.steps} onChange={handleChange} placeholder="Write the cooking steps" rows="4" required />

              <label htmlFor="cookingTime">Cooking Time (minutes)</label>
              <input id="cookingTime" type="number" name="cookingTime" value={form.cookingTime} onChange={handleChange} min="1" step="1" placeholder="e.g. 30" required />

              <button className="primary-btn" type="submit">
                {editingId ? 'Update Recipe' : 'Save Recipe'}
              </button>

              {editingId && (
                <button className="delete-btn" type="button" onClick={cancelEdit}>
                  Cancel Edit
                </button>
              )}
            </form>
          </section>

          <section className="panel">
            <div className="recipe-heading">
              <h2>📖 My Recipes</h2>
              <span>{recipes.length} recipes</span>
            </div>

            {loading ? (
              <p>Loading recipes...</p>
            ) : recipes.length === 0 ? (
              <div className="empty">
                <div className="empty-icon">🥗</div>
                <h3>No recipes yet</h3>
                <p>Add your first recipe using the form.</p>
              </div>
            ) : (
              <div className="recipe-list">
                {recipes.map(recipe => (
                  <article className="recipe-card" key={recipe._id}>
                    <div className="recipe-heading">
                      <h3
                        className="clickable-title"
                        onClick={() => setSelectedRecipe(recipe)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={event => {
                          if (event.key === 'Enter' || event.key === ' ') {
                            setSelectedRecipe(recipe);
                          }
                        }}
                      >
                        {recipe.name}
                      </h3>
                      <span>{recipe.category}</span>
                    </div>

                    <p><strong>Cooking time:</strong> {recipe.cookingTime} minutes</p>

                    <button
                      className="primary-btn"
                      type="button"
                      onClick={() => setSelectedRecipe(recipe)}
                    >
                      View Details
                    </button>

                    {' '}
                    <button className="primary-btn" type="button" onClick={() => editRecipe(recipe)}>
                      Edit Recipe
                    </button>
                    {' '}
                    <button className="delete-btn" type="button" onClick={() => deleteRecipe(recipe._id)}>
                      Delete Recipe
                    </button>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>

      {selectedRecipe && (
        <div className="modal-overlay" onClick={() => setSelectedRecipe(null)}>
          <section
            className="recipe-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="details-title"
            onClick={event => event.stopPropagation()}
          >
            <button
              type="button"
              className="modal-close"
              onClick={() => setSelectedRecipe(null)}
              aria-label="Close recipe details"
            >
              ✕
            </button>

            <h2 id="details-title">{selectedRecipe.name}</h2>
            <p><strong>Category:</strong> {selectedRecipe.category}</p>
            <p><strong>Cooking Time:</strong> {selectedRecipe.cookingTime} minutes</p>

            <h3>Ingredients</h3>
            <p>{selectedRecipe.ingredients}</p>

            <h3>Preparation Steps</h3>
            <p>{selectedRecipe.steps}</p>
          </section>
        </div>
      )}
    </div>
  );
}

export default App;
