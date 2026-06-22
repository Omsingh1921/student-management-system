package com.student.utils;


import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.util.StringUtils;

public final class PaginationUtil {

    private static final int DEFAULT_PAGE_NUMBER = 1;
    private static final int DEFAULT_PAGE_SIZE = 10;
    private static final String SORT_DELIMITER = ",";

    private PaginationUtil() {
        throw new UnsupportedOperationException("This is a utility class and cannot be instantiated");
    }

    public static Pageable createPageable(Integer page, Integer size, 
            String sortBy, String direction) {
int currentPage = (page == null || page < 1) ? DEFAULT_PAGE_NUMBER : page;
int pageSize = (size == null || size < 1) ? DEFAULT_PAGE_SIZE : size;

Sort sort = Sort.unsorted();
if (sortBy != null && !sortBy.isEmpty()) {
Sort.Direction dir = direction != null && direction.equalsIgnoreCase("desc") 
   ? Sort.Direction.DESC : Sort.Direction.ASC;
sort = Sort.by(dir, sortBy);
}
return PageRequest.of(currentPage - 1, pageSize, sort);
}
}