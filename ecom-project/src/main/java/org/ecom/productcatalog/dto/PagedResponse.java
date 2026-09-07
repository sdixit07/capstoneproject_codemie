package org.ecom.productcatalog.dto;

import java.util.List;

public class PagedResponse<T> {

    private List<T> content;
    private Page page;
    private Sort sort;

    public PagedResponse() {}

    public PagedResponse(List<T> content, Page page, Sort sort) {
        this.content = content;
        this.page = page;
        this.sort = sort;
    }

    public List<T> getContent() {
        return content;
    }

    public void setContent(List<T> content) {
        this.content = content;
    }

    public Page getPage() {
        return page;
    }

    public void setPage(Page page) {
        this.page = page;
    }

    public Sort getSort() {
        return sort;
    }

    public void setSort(Sort sort) {
        this.sort = sort;
    }

    public static class Page {
        private int number;
        private int size;
        private long totalElements;
        private int totalPages;
        private boolean first;
        private boolean last;

        public Page() {}

        public Page(int number, int size, long totalElements, int totalPages, boolean first, boolean last) {
            this.number = number;
            this.size = size;
            this.totalElements = totalElements;
            this.totalPages = totalPages;
            this.first = first;
            this.last = last;
        }

        public int getNumber() { return number; }
        public void setNumber( int number) { this.number = number; }

        public int getSize() { return size; }
        public void setSize(int size) { this.size = size; }

        public long getTotalElements() { return totalElements; }
        public void setTotalElements(long totalElements) { this.totalElements = totalElements; }

        public int getTotalPages() { return totalPages; }
        public void setTotalPages(int totalPages) { this.totalPages = totalPages; }

        public boolean isFirst() { return first; }
        public void setFirst(boolean first) { this.first = first; }

        public boolean isLast() { return last; }
        public void setLast(boolean last) { this.last = last; }
    }

    public static class Sort {
        private String by;
        private String direction;

        public Sort() {}
        public Sort(String by, String direction) {
            this.by = by;
            this.direction = direction;
        }

        public String getBy() { return by; }
        public void setBy(String by) { this.by = by; }

        public String getDirection() { return direction; }
        public void setDirection(String direction) { this.direction = direction; }
    }
}
