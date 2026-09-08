const CategoryFilter = ({ categories, onCategorySelect }) => {
  return (
    <select
      id="categorySelect"
      className="form-control"
      onChange={(e) => onCategorySelect(e.target.value)}
    >
      <option value="">All Categories</option>
      {categories.map((category) => (
        <option key={category.id} value={category.id}>
          {category.name}
        </option>
      ))}
    </select>
  );
};

export default CategoryFilter;
