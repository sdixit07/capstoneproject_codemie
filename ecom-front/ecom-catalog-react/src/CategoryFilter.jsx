const CategoryFilter = ({categories, onSelect}) => {
    return(
            <select id="categorySelect" aria-label="Filter by category" className="form-control" onChange={(e) => onSelect(e.target.value)}>
                <option value=""> All Categories</option>
                {categories.map(category =>(
                    <option key={category.id} value={category.id}>{category.name}</option>
                ))
                }
            </select>
    )
}

export default CategoryFilter;
