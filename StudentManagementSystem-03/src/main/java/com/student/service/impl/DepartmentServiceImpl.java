package com.student.service.impl;

import java.util.List;
import java.util.stream.Collectors;

import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.student.dto.request.DepartmentRequestDTO;
import com.student.dto.response.CourseResponseDTO;
import com.student.dto.response.DepartmentResponseDTO;
import com.student.dto.response.TeacherResponseDTO;
import com.student.entity.Course;
import com.student.entity.Department;
import com.student.entity.Teacher;
import com.student.exception.BusinessValidationException;
import com.student.exception.DuplicateResourceException;
import com.student.exception.ResourceNotFoundException;
import com.student.reposiotry.CourseRepository;
import com.student.reposiotry.DepartmentRepository;
import com.student.reposiotry.TeacherRepository;
import com.student.service.DepartmentService;
import com.student.utils.PaginationUtil;

import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
@Transactional(readOnly = true)
public class DepartmentServiceImpl implements DepartmentService {
	

    @Autowired private TeacherRepository teacherRepository;
    @Autowired private DepartmentRepository departmentRepository;
    @Autowired private CourseRepository courseRepository;
    @Autowired private ModelMapper modelMapper;

    @Override
    @Transactional
    @PreAuthorize("hasRole('ADMIN')")
    public DepartmentResponseDTO createDepartment(DepartmentRequestDTO request) {
        if (departmentRepository.existsByNameAndIsDeletedFalse(request.getName()))
            throw new DuplicateResourceException("Department name exists");
        Department dept = modelMapper.map(request, Department.class);
        dept.setDeleted(false);
        return modelMapper.map(departmentRepository.save(dept), DepartmentResponseDTO.class);
    }
    
    public List<DepartmentResponseDTO> getAllDepartmentss() {
        List<Department> departments = departmentRepository.findByIsDeletedFalse();
        return departments.stream()
                .map(dept -> modelMapper.map(dept, DepartmentResponseDTO.class))
                .collect(Collectors.toList());
    }
    
    public List<CourseResponseDTO> getCoursesByDepartment(Long departmentId) {
        // Check if department exists
        departmentRepository.findById(departmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Department not found with id: " + departmentId));

        List<Course> courses = courseRepository.findByDepartmentIdAndIsDeletedFalse(departmentId);
        return courses.stream()
                .map(course -> modelMapper.map(course, CourseResponseDTO.class))
                .collect(Collectors.toList());
    }

    @Override
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'STUDENT')")
    public Page<DepartmentResponseDTO> getAllDepartments(int page, int size, String sortBy, String direction) {
        Pageable pageable = PaginationUtil.createPageable(page, size, sortBy, direction);
        return departmentRepository.findAll(pageable).map(d -> modelMapper.map(d, DepartmentResponseDTO.class));
    }

    @Override
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'STUDENT')")
    public DepartmentResponseDTO getDepartmentById(Long id) {
        Department dept = departmentRepository.findByIdAndIsDeletedFalse(id)
                .orElseThrow(() -> new ResourceNotFoundException("Department not found"));
        return modelMapper.map(dept, DepartmentResponseDTO.class);
    }

    @Override
    @Transactional
    @PreAuthorize("hasRole('ADMIN')")
    public DepartmentResponseDTO updateDepartment(Long id, DepartmentRequestDTO request) {
        Department dept = departmentRepository.findByIdAndIsDeletedFalse(id)
                .orElseThrow(() -> new ResourceNotFoundException("Department not found"));
        dept.setName(request.getName());
        dept.setDescription(request.getDescription());
        return modelMapper.map(departmentRepository.save(dept), DepartmentResponseDTO.class);
    }

    @Override
    @Transactional
    @PreAuthorize("hasRole('ADMIN')")
    public void softDeleteDepartment(Long id) {
        if (departmentRepository.hasActiveCourses(id)) {
            throw new BusinessValidationException("Cannot delete department with active courses");
        }
        int updated = departmentRepository.softDeleteIfNoCourses(id);
        if (updated == 0) throw new ResourceNotFoundException("Department not found or has courses");
        log.info("Department soft deleted: {}", id);
    }
    
    @Transactional
	@Override
	public TeacherResponseDTO assignTeacherToDepartment(Long departmentId, Long teacherId) {
		System.err.println("hi");
		  Department dept = departmentRepository.findByIdAndIsDeletedFalse(departmentId)
	                .orElseThrow(() -> new ResourceNotFoundException("Department not found"));
		  System.err.println("Department "+dept);
		  Teacher teacher = teacherRepository.findByIdAndActiveTrue(teacherId)
	                .orElseThrow(() -> new ResourceNotFoundException("Teacher not found"));
	       teacher.setDepartment(dept);
	       System.err.println("Teacher "+teacher.getDepartment());
	       
	       System.out.println("Teacher "+teacher.toString());
	       System.out.println(teacherRepository.save(teacher).getDepartment().getName());
	       System.out.println(teacherRepository.findByIdAndActiveTrue(teacherId));
		return mapToResponse(teacherRepository.save(teacher));
	}
	
	  private TeacherResponseDTO mapToResponse(Teacher teacher) {
	    	TeacherResponseDTO dto = new TeacherResponseDTO();
	        dto.setId(teacher.getId());
	        dto.setName(teacher.getName());
	        dto.setEmail(teacher.getEmail());
	        dto.setRole(teacher.getRole());
	        dto.setActive(teacher.isActive());
	        if(teacher.getDepartment()!=null) {
	        dto.setDepartment_id(teacher.getDepartment().getId());
	        dto.setDepartmentName(teacher.getDepartment().getName());}
	        
	        // Add mobileNumber if UserResponseDTO contains it
	        // dto.setMobileNumber(teacher.getMobileNumber());
	        return dto;
	    }

	  @Override
	  public Page<TeacherResponseDTO> getTeachersByDepartmentId(Long departmentId, int page, int size) {
	      // Create Pageable object from page and size
	      Pageable pageable = PageRequest.of(page, size);
	      
	      // Fetch the page of Teacher entities for the given departmentId
	      Page<Teacher> teacherPage = teacherRepository.findByDepartmentId(departmentId, pageable);
	      
	      // Convert each Teacher entity to TeacherResponseDTO manually
	      return teacherPage.map(teacher -> {
	          TeacherResponseDTO dto = new TeacherResponseDTO();
	          // Manual mapping of fields
	          dto.setId(teacher.getId());
	          dto.setName(teacher.getName());
	          dto.setEmail(teacher.getEmail());
	          dto.setDepartment_id(departmentId);
	          dto.setDepartmentName(teacher.getDepartment().getName());
	          // Add any other fields you need
	          return dto;
	      });
	  }
}
