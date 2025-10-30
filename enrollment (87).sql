-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Oct 30, 2025 at 02:46 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `enrollment`
--

-- --------------------------------------------------------

--
-- Table structure for table `active_school_year_table`
--

CREATE TABLE `active_school_year_table` (
  `id` int(11) NOT NULL,
  `year_id` int(11) DEFAULT NULL,
  `semester_id` int(11) DEFAULT NULL,
  `astatus` int(11) DEFAULT NULL,
  `active` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `active_school_year_table`
--

INSERT INTO `active_school_year_table` (`id`, `year_id`, `semester_id`, `astatus`, `active`) VALUES
(1, 4, 1, 0, 0),
(2, 9, 2, 0, 0),
(3, 9, 1, 0, 0),
(4, 10, 2, 0, 0),
(6, 4, 2, 0, 0),
(8, 12, 2, 0, 0),
(9, 3, 2, 0, 0),
(10, 13, 2, 0, 0),
(11, 13, 1, 0, 0),
(12, 5, 1, 0, 0),
(13, 5, 2, 0, 0),
(14, 5, 3, 0, 0),
(15, 3, 1, 0, 0),
(16, 10, 1, 1, 0);

-- --------------------------------------------------------

--
-- Table structure for table `course_table`
--

CREATE TABLE `course_table` (
  `course_id` int(11) NOT NULL,
  `course_code` varchar(100) DEFAULT NULL,
  `course_description` varchar(255) DEFAULT NULL,
  `course_unit` int(11) DEFAULT NULL,
  `lab_unit` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `course_table`
--

INSERT INTO `course_table` (`course_id`, `course_code`, `course_description`, `course_unit`, `lab_unit`) VALUES
(1, 'GEREADPH', 'Readings in Philippine History', 5, 0),
(2, 'GEUNDETS', 'Understanding the Self', 3, 0),
(3, 'GEARTAPP', 'Art Appreciation', 3, 0),
(4, 'GEPURPCO', 'Purposive Communication', 3, 0),
(5, 'GEKOMFIL', 'Kontekstwalisadong Komunikasyon sa Filipino', 3, 0),
(6, 'INTCOMLC', 'Introduction to Computing (Lecture)', 2, 0),
(7, 'INTCOMLB', 'Introduction to Computing (Laboratory)', 0, 1),
(8, 'FPROGLEC', 'Computer Programming 1 (Lecture)', 2, 0),
(9, 'FPROGLAB', 'Computer Programming 1 (Laboratory)', 0, 1),
(10, 'GEPEMOVE', 'Movement Enhancement', 2, 0),
(11, 'NSTPCTS1', 'National Service Training Program 1', 3, 0),
(12, 'GEMATHMW', 'Mathematics in the Modern World', 3, 0),
(13, 'GESCIETS', 'Science, Technology and Society', 3, 0),
(14, 'GEFILDIS', 'Filipino sa Iba’t-Ibang Disiplina', 3, 0),
(15, 'GEPANIPI', 'Panitikan sa Pilipinas', 3, 0),
(16, 'IPROGLEC', 'Computer Programming 2 (Lecture)', 2, 0),
(17, 'IPROGLAB', 'Computer Programming 2 (Laboratory)', 0, 1),
(18, 'DISCMATH', 'Discrete Mathematics', 3, 0),
(19, 'DBMSLEC1', 'Database Management System 1 (Lecture)', 2, 0),
(20, 'DBMSLAB1', 'Database Management System 1 (Laboratory)', 0, 1),
(21, 'GEPEFITE', 'Fitness Exercise', 2, 0),
(22, 'NSTPCTS2', 'National Service Training Program 2', 3, 0),
(23, 'GEETHICS', 'Ethics', 3, 0),
(24, 'DSALGLEC', 'Data Structures and Algorithm 1 (Lecture)', 2, 0),
(25, 'DSALGLAB', 'Data Structures and Algorithm 1 (Laboratory)', 0, 1),
(26, 'INFMGTLC', 'Information Management (Lecture)', 2, 0),
(27, 'INFMGTLB', 'Information Management (Laboratory)', 0, 1),
(28, 'PTECHLEC', 'Platform Technologies (Lecture)', 2, 0),
(29, 'PTECHLAB', 'Platform Technologies (Laboratory)', 0, 1),
(30, 'WEBDVLC1', 'Web Development 1 (Lecture)', 2, 0),
(31, 'WEBDVLB1', 'Web Development 1 (Laboratory)', 0, 1),
(32, 'BUSANALY', 'Business Analytics', 3, 0),
(33, 'GEPEHEF1', 'Physical Activity Towards Health and Fitness 1', 2, 0),
(34, 'GEELECCP', 'Communicative Proficiency in Business Writing', 3, 0),
(35, 'DBMSLEC2', 'Database Management System 2 (Lecture)', 2, 0),
(36, 'DBMSLAB2', 'Database Management System 2 (Laboratory)', 0, 1),
(37, 'INTHCILC', 'Introduction to Human-Computer Interaction (Lecture)', 2, 0),
(38, 'INTHCILB', 'Introduction to Human-Computer Interaction (Laboratory)', 0, 1),
(39, 'NETWKLC1', 'Networking 1 (Lecture)', 2, 0),
(40, 'NETWKLB1', 'Networking 1 (Laboratory)', 0, 1),
(41, 'WEBDVLC2', 'Web Development 2 (Lecture)', 2, 0),
(42, 'WEBDVLB2', 'Web Development 2 (Laboratory)', 0, 1),
(43, 'IPATLEC1', 'Integrative Programming and Technologies 1 (Lecture)', 2, 0),
(44, 'IPATLAB1', 'Integrative Programming and Technologies 1 (Laboratory)', 0, 1),
(45, 'GEPEHEF2', 'Physical Activity Towards Health and Fitness 2', 2, 0),
(46, 'GEELECDS', 'Practical Data Science', 3, 0),
(47, 'WEBDVLC3', 'Web Development 3 (Lecture)', 2, 0),
(48, 'WEBDVLB3', 'Web Development 3 (Laboratory)', 0, 1),
(49, 'MMDIALEC', 'Multimedia (Lecture)', 2, 0),
(50, 'MMDIALAB', 'Multimedia (Laboratory)', 0, 1),
(51, 'SYSARCH1', 'Systems Integration and Architecture 1 (Lecture)', 2, 0),
(52, 'SYSARLB1', 'Systems Integration and Architecture 1 (Laboratory)', 0, 1),
(53, 'APDEVLEC', 'Application Development and Emerging Tech (Lecture)', 2, 0),
(54, 'APDEVLAB', 'Application Development and Emerging Tech (Lab)', 0, 1),
(55, 'NETWKLC2', 'Networking 2 (Lecture)', 2, 0),
(56, 'NETWKLB2', 'Networking 2 (Laboratory)', 0, 1),
(57, 'GELIFEWR', 'Life and Works of Rizal', 3, 0),
(58, 'GEELECES', 'Environmental Science', 3, 0),
(59, 'QUANMETH', 'Quantitative Methods', 3, 0),
(60, 'ITTHESI1', 'Research 1', 3, 0),
(61, 'MOBAPLEC', 'Mobile App Development (Lecture)', 2, 0),
(62, 'MOBAPLAB', 'Mobile App Development (Laboratory)', 0, 1),
(63, 'OOPRGLEC', 'Object-Oriented Programming (Lecture)', 2, 0),
(64, 'OOPRGLAB', 'Object-Oriented Programming (Laboratory)', 0, 1),
(65, 'IAASLEC1', 'Information Assurance and Security 1 (Lecture)', 2, 0),
(66, 'IAASLAB1', 'Information Assurance and Security 1 (Laboratory)', 0, 1),
(67, 'GECONTWO', 'Contemporary World', 3, 0),
(68, 'SYSARCH2', 'Systems Integration and Architecture 2 (Lecture)', 2, 0),
(69, 'SYSARLB2', 'Systems Integration and Architecture 2 (Laboratory)', 0, 1),
(70, 'ITTHESI2', 'Research 2 (Lecture)', 2, 0),
(71, 'ITTHESL2', 'Research 2 (Laboratory)', 0, 1),
(72, 'IAASLEC2', 'Information Assurance and Security 2 (Lecture)', 2, 0),
(73, 'IAASLAB2', 'Information Assurance and Security 2 (Laboratory)', 0, 1),
(74, 'SYSADMLC', 'Systems Administration and Maintenance (Lecture)', 2, 0),
(75, 'SYSADMLB', 'Systems Administration and Maintenance (Laboratory)', 0, 1),
(76, 'SPISSUES', 'Social and Professional Issues', 3, 0),
(77, 'ITINTERN', 'Practicum / Internship', 10, 0),
(78, 'GELIFEWR', 'Life And Work of Rizal', 2, 0),
(79, 'GELIFEWR', 'Life And Work of Rizal', 2, 0),
(80, 'DATANALY', 'Data Analytics ', 3, 0),
(81, 'ITTHESIS', 'THESIS 2', 2, 1);

-- --------------------------------------------------------

--
-- Table structure for table `curriculum_table`
--

CREATE TABLE `curriculum_table` (
  `curriculum_id` int(11) NOT NULL,
  `year_id` int(11) DEFAULT NULL,
  `program_id` int(11) DEFAULT NULL,
  `lock_status` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `curriculum_table`
--

INSERT INTO `curriculum_table` (`curriculum_id`, `year_id`, `program_id`, `lock_status`) VALUES
(1, 1, 1, 1),
(2, 2, 2, 1),
(3, 3, 3, 1),
(4, 4, 4, 1),
(5, 5, 5, 0),
(6, 6, 6, 0),
(7, 7, 7, 0),
(8, 8, 8, 0),
(9, 9, 9, 0),
(10, 10, 10, 0),
(11, 11, 11, 0),
(12, 12, 12, 0),
(13, 13, 13, 0),
(14, 14, 14, 0),
(15, 15, 15, 0),
(16, 16, 16, 0),
(17, 17, 17, 0),
(18, 18, 18, 0),
(19, 19, 19, 0),
(20, 20, 20, 0),
(21, 21, 21, 0),
(22, 22, 22, 0),
(23, 23, 23, 0),
(24, 24, 24, 0),
(25, 25, 25, 0),
(26, 26, 26, 0),
(27, 27, 27, 0),
(28, 28, 28, 0),
(29, 29, 29, 0),
(30, 30, 30, 0),
(31, 31, 31, 0),
(32, 32, 32, 0),
(33, 33, 33, 0),
(34, 34, 34, 0),
(35, 35, 35, 0),
(36, 36, 36, 0),
(37, 37, 37, 0),
(38, 38, 38, 0),
(39, 39, 39, 0),
(40, 40, 40, 0),
(41, 41, 41, 0),
(42, 42, 42, 0),
(43, 43, 43, 0),
(44, 44, 44, 0),
(45, 45, 45, 0),
(46, 46, 46, 0),
(47, 47, 47, 0),
(48, 48, 48, 0),
(49, 49, 49, 0),
(50, 50, 50, 0),
(51, 51, 51, 0),
(52, 52, 52, 0),
(53, 53, 53, 0),
(54, 54, 54, 0),
(55, 55, 55, 0),
(56, 5, 58, 0),
(57, 4, 15, 0);

-- --------------------------------------------------------

--
-- Table structure for table `dprtmnt_curriculum_table`
--

CREATE TABLE `dprtmnt_curriculum_table` (
  `dprtmnt_curriculum_id` int(11) NOT NULL,
  `dprtmnt_id` int(11) DEFAULT NULL,
  `curriculum_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `dprtmnt_curriculum_table`
--

INSERT INTO `dprtmnt_curriculum_table` (`dprtmnt_curriculum_id`, `dprtmnt_id`, `curriculum_id`) VALUES
(1, 1, 1),
(2, 1, 2),
(3, 1, 3),
(4, 1, 4),
(5, 2, 5),
(6, 2, 6),
(7, 2, 7),
(8, 3, 8),
(9, 3, 9),
(10, 3, 10),
(11, 3, 11),
(12, 4, 12),
(13, 4, 13),
(14, 5, 14),
(15, 5, 15),
(16, 6, 16),
(17, 6, 17),
(18, 6, 18),
(19, 6, 19),
(20, 6, 20),
(21, 6, 21),
(22, 6, 22),
(23, 6, 23),
(24, 7, 24),
(25, 7, 25),
(26, 7, 26),
(27, 7, 27),
(28, 7, 28),
(29, 7, 29),
(30, 8, 30),
(31, 8, 31),
(32, 9, 32),
(33, 9, 33),
(34, 9, 34),
(35, 9, 35),
(36, 9, 36),
(37, 9, 37),
(38, 9, 38),
(39, 9, 39),
(40, 9, 40),
(41, 10, 41),
(42, 10, 42),
(43, 10, 43),
(44, 10, 44),
(45, 11, 45),
(46, 11, 46),
(47, 11, 47),
(48, 11, 48),
(49, 11, 49),
(50, 11, 50),
(51, 11, 51),
(52, 11, 52),
(53, 11, 53),
(54, 11, 54),
(55, 11, 55);

-- --------------------------------------------------------

--
-- Table structure for table `dprtmnt_profs_table`
--

CREATE TABLE `dprtmnt_profs_table` (
  `dprtmnt_profs_id` int(11) NOT NULL,
  `dprtmnt_id` int(11) DEFAULT NULL,
  `prof_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `dprtmnt_profs_table`
--

INSERT INTO `dprtmnt_profs_table` (`dprtmnt_profs_id`, `dprtmnt_id`, `prof_id`) VALUES
(1, 5, 1),
(2, 2, 2),
(3, 2, 3),
(4, 5, 4),
(5, 5, 5),
(6, 5, 6),
(7, 2, 7),
(8, 2, 8),
(9, 5, 9),
(10, 2, 10),
(11, 2, 11),
(12, 2, 12),
(13, 5, 13),
(14, 5, 14),
(15, 2, 15),
(16, 2, 16),
(17, 2, 17),
(18, 2, 18),
(19, 5, 19),
(20, 2, 20),
(21, 2, 21),
(22, 2, 22),
(23, 2, 23),
(24, 2, 24),
(25, 2, 25),
(26, 2, 17),
(27, 2, 18),
(28, 2, 20),
(29, 2, 21),
(30, 2, 22),
(31, 2, 23),
(32, 2, 24),
(33, 2, 25),
(34, 2, 26),
(35, 2, 27),
(36, 2, 29),
(37, 2, 30),
(38, 11, 59),
(39, 5, 60),
(40, 5, 28),
(41, 5, 37),
(42, 5, 34),
(43, 5, 31),
(44, 5, 36),
(45, 5, 32),
(46, 5, 33),
(47, 5, 35),
(48, 5, 61),
(49, 1, 62),
(50, 1, 38),
(51, 1, 63),
(52, 5, 65);

-- --------------------------------------------------------

--
-- Table structure for table `dprtmnt_room_table`
--

CREATE TABLE `dprtmnt_room_table` (
  `dprtmnt_room_id` int(11) NOT NULL,
  `dprtmnt_id` int(11) DEFAULT NULL,
  `room_id` int(11) DEFAULT NULL,
  `lock_status` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `dprtmnt_room_table`
--

INSERT INTO `dprtmnt_room_table` (`dprtmnt_room_id`, `dprtmnt_id`, `room_id`, `lock_status`) VALUES
(3, 5, 3, 0),
(5, 5, 5, 0),
(13, 2, 13, 0),
(14, 2, 14, 0),
(15, 2, 15, 0),
(16, 2, 16, 0),
(17, 2, 17, 0),
(18, 2, 18, 0),
(19, 2, 19, 0),
(20, 2, 20, 0),
(21, 1, 21, 0),
(22, 5, 24, 0),
(23, 5, 4, 0);

-- --------------------------------------------------------

--
-- Table structure for table `dprtmnt_section_table`
--

CREATE TABLE `dprtmnt_section_table` (
  `id` int(11) NOT NULL,
  `curriculum_id` int(11) DEFAULT NULL,
  `section_id` int(11) DEFAULT NULL,
  `dsstat` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `dprtmnt_section_table`
--

INSERT INTO `dprtmnt_section_table` (`id`, `curriculum_id`, `section_id`, `dsstat`) VALUES
(1, 1, 1, 0),
(2, 1, 2, 0),
(3, 1, 3, 0),
(4, 1, 4, 0),
(5, 1, 5, 0),
(6, 1, 6, 0),
(7, 1, 7, 0),
(8, 1, 8, 0),
(9, 1, 9, 0),
(10, 1, 10, 0),
(11, 1, 11, 0),
(12, 1, 12, 0),
(13, 2, 1, 0),
(14, 2, 2, 0),
(15, 2, 3, 0),
(16, 2, 4, 0),
(17, 2, 5, 0),
(18, 2, 6, 0),
(19, 2, 7, 0),
(20, 2, 8, 0),
(21, 2, 9, 0),
(22, 2, 10, 0),
(23, 2, 11, 0),
(24, 2, 12, 0),
(25, 3, 1, 0),
(26, 3, 2, 0),
(27, 3, 3, 0),
(28, 3, 4, 0),
(29, 3, 5, 0),
(30, 3, 6, 0),
(31, 3, 7, 0),
(32, 3, 8, 0),
(33, 3, 9, 0),
(34, 3, 10, 0),
(35, 3, 11, 0),
(36, 3, 12, 0),
(37, 4, 1, 0),
(38, 4, 2, 0),
(39, 4, 3, 0),
(40, 4, 4, 0),
(41, 4, 5, 0),
(42, 4, 6, 0),
(43, 4, 7, 0),
(44, 4, 8, 0),
(45, 4, 9, 0),
(46, 4, 10, 0),
(47, 4, 11, 0),
(48, 4, 12, 0),
(49, 5, 1, 0),
(50, 5, 2, 0),
(51, 5, 3, 0),
(52, 5, 4, 0),
(53, 5, 5, 0),
(54, 5, 6, 0),
(55, 5, 7, 0),
(56, 5, 8, 0),
(57, 5, 9, 0),
(58, 5, 10, 0),
(59, 5, 11, 0),
(60, 5, 12, 0),
(61, 6, 1, 0),
(62, 6, 2, 0),
(63, 6, 3, 0),
(64, 6, 4, 0),
(65, 6, 5, 0),
(66, 6, 6, 0),
(67, 6, 7, 0),
(68, 6, 8, 0),
(69, 6, 9, 0),
(70, 6, 10, 0),
(71, 6, 11, 0),
(72, 6, 12, 0),
(73, 7, 1, 0),
(74, 7, 2, 0),
(75, 7, 3, 0),
(76, 7, 4, 0),
(77, 7, 5, 0),
(78, 7, 6, 0),
(79, 7, 7, 0),
(80, 7, 8, 0),
(81, 7, 9, 0),
(82, 7, 10, 0),
(83, 7, 11, 0),
(84, 7, 12, 0),
(85, 8, 1, 0),
(86, 8, 2, 0),
(87, 8, 3, 0),
(88, 8, 4, 0),
(89, 8, 5, 0),
(90, 8, 6, 0),
(91, 8, 7, 0),
(92, 8, 8, 0),
(93, 8, 9, 0),
(94, 8, 10, 0),
(95, 8, 11, 0),
(96, 8, 12, 0),
(97, 9, 1, 0),
(98, 9, 2, 0),
(99, 9, 3, 0),
(100, 9, 4, 0),
(101, 9, 5, 0),
(102, 9, 6, 0),
(103, 9, 7, 0),
(104, 9, 8, 0),
(105, 9, 9, 0),
(106, 9, 10, 0),
(107, 9, 11, 0),
(108, 9, 12, 0),
(109, 10, 1, 0),
(110, 10, 2, 0),
(111, 10, 3, 0),
(112, 10, 4, 0),
(113, 10, 5, 0),
(114, 10, 6, 0),
(115, 10, 7, 0),
(116, 10, 8, 0),
(117, 10, 9, 0),
(118, 10, 10, 0),
(119, 10, 11, 0),
(120, 10, 12, 0),
(121, 11, 1, 0),
(122, 11, 2, 0),
(123, 11, 3, 0),
(124, 11, 4, 0),
(125, 11, 5, 0),
(126, 11, 6, 0),
(127, 11, 7, 0),
(128, 11, 8, 0),
(129, 11, 9, 0),
(130, 11, 10, 0),
(131, 11, 11, 0),
(132, 11, 12, 0),
(133, 12, 1, 0),
(134, 12, 2, 0),
(135, 12, 3, 0),
(136, 12, 4, 0),
(137, 12, 5, 0),
(138, 12, 6, 0),
(139, 12, 7, 0),
(140, 12, 8, 0),
(141, 12, 9, 0),
(142, 12, 10, 0),
(143, 12, 11, 0),
(144, 12, 12, 0),
(145, 13, 1, 0),
(146, 13, 2, 0),
(147, 13, 3, 0),
(148, 13, 4, 0),
(149, 13, 5, 0),
(150, 13, 6, 0),
(151, 13, 7, 0),
(152, 13, 8, 0),
(153, 13, 9, 0),
(154, 13, 10, 0),
(155, 13, 11, 0),
(156, 13, 12, 0),
(157, 14, 1, 0),
(158, 14, 2, 0),
(159, 14, 3, 0),
(160, 14, 4, 0),
(161, 14, 5, 0),
(162, 14, 6, 0),
(163, 14, 7, 0),
(164, 14, 8, 0),
(165, 14, 9, 0),
(166, 14, 10, 0),
(167, 14, 11, 0),
(168, 14, 12, 0),
(169, 15, 1, 0),
(170, 15, 2, 0),
(171, 15, 3, 0),
(172, 15, 4, 0),
(173, 15, 5, 0),
(174, 15, 6, 0),
(175, 15, 7, 0),
(176, 15, 8, 0),
(177, 15, 9, 0),
(178, 15, 10, 0),
(179, 15, 11, 0),
(180, 15, 12, 0),
(181, 16, 1, 0),
(182, 16, 2, 0),
(183, 16, 3, 0),
(184, 16, 4, 0),
(185, 16, 5, 0),
(186, 16, 6, 0),
(187, 16, 7, 0),
(188, 16, 8, 0),
(189, 16, 9, 0),
(190, 16, 10, 0),
(191, 16, 11, 0),
(192, 16, 12, 0),
(193, 17, 1, 0),
(194, 17, 2, 0),
(195, 17, 3, 0),
(196, 17, 4, 0),
(197, 17, 5, 0),
(198, 17, 6, 0),
(199, 17, 7, 0),
(200, 17, 8, 0),
(201, 17, 9, 0),
(202, 17, 10, 0),
(203, 17, 11, 0),
(204, 17, 12, 0),
(205, 18, 1, 0),
(206, 18, 2, 0),
(207, 18, 3, 0),
(208, 18, 4, 0),
(209, 18, 5, 0),
(210, 18, 6, 0),
(211, 18, 7, 0),
(212, 18, 8, 0),
(213, 18, 9, 0),
(214, 18, 10, 0),
(215, 18, 11, 0),
(216, 18, 12, 0),
(217, 19, 1, 0),
(218, 19, 2, 0),
(219, 19, 3, 0),
(220, 19, 4, 0),
(221, 19, 5, 0),
(222, 19, 6, 0),
(223, 19, 7, 0),
(224, 19, 8, 0),
(225, 19, 9, 0),
(226, 19, 10, 0),
(227, 19, 11, 0),
(228, 19, 12, 0),
(229, 20, 1, 0),
(230, 20, 2, 0),
(231, 20, 3, 0),
(232, 20, 4, 0),
(233, 20, 5, 0),
(234, 20, 6, 0),
(235, 20, 7, 0),
(236, 20, 8, 0),
(237, 20, 9, 0),
(238, 20, 10, 0),
(239, 20, 11, 0),
(240, 20, 12, 0),
(241, 21, 1, 0),
(242, 21, 2, 0),
(243, 21, 3, 0),
(244, 21, 4, 0),
(245, 21, 5, 0),
(246, 21, 6, 0),
(247, 21, 7, 0),
(248, 21, 8, 0),
(249, 21, 9, 0),
(250, 21, 10, 0),
(251, 21, 11, 0),
(252, 21, 12, 0),
(253, 22, 1, 0),
(254, 22, 2, 0),
(255, 22, 3, 0),
(256, 22, 4, 0),
(257, 22, 5, 0),
(258, 22, 6, 0),
(259, 22, 7, 0),
(260, 22, 8, 0),
(261, 22, 9, 0),
(262, 22, 10, 0),
(263, 22, 11, 0),
(264, 22, 12, 0),
(265, 23, 1, 0),
(266, 23, 2, 0),
(267, 23, 3, 0),
(268, 23, 4, 0),
(269, 23, 5, 0),
(270, 23, 6, 0),
(271, 23, 7, 0),
(272, 23, 8, 0),
(273, 23, 9, 0),
(274, 23, 10, 0),
(275, 23, 11, 0),
(276, 23, 12, 0),
(277, 24, 1, 0),
(278, 24, 2, 0),
(279, 24, 3, 0),
(280, 24, 4, 0),
(281, 24, 5, 0),
(282, 24, 6, 0),
(283, 24, 7, 0),
(284, 24, 8, 0),
(285, 24, 9, 0),
(286, 24, 10, 0),
(287, 24, 11, 0),
(288, 24, 12, 0),
(289, 25, 1, 0),
(290, 25, 2, 0),
(291, 25, 3, 0),
(292, 25, 4, 0),
(293, 25, 5, 0),
(294, 25, 6, 0),
(295, 25, 7, 0),
(296, 25, 8, 0),
(297, 25, 9, 0),
(298, 25, 10, 0),
(299, 25, 11, 0),
(300, 25, 12, 0),
(301, 26, 1, 0),
(302, 26, 2, 0),
(303, 26, 3, 0),
(304, 26, 4, 0),
(305, 26, 5, 0),
(306, 26, 6, 0),
(307, 26, 7, 0),
(308, 26, 8, 0),
(309, 26, 9, 0),
(310, 26, 10, 0),
(311, 26, 11, 0),
(312, 26, 12, 0),
(313, 27, 1, 0),
(314, 27, 2, 0),
(315, 27, 3, 0),
(316, 27, 4, 0),
(317, 27, 5, 0),
(318, 27, 6, 0),
(319, 27, 7, 0),
(320, 27, 8, 0),
(321, 27, 9, 0),
(322, 27, 10, 0),
(323, 27, 11, 0),
(324, 27, 12, 0),
(325, 28, 1, 0),
(326, 28, 2, 0),
(327, 28, 3, 0),
(328, 28, 4, 0),
(329, 28, 5, 0),
(330, 28, 6, 0),
(331, 28, 7, 0),
(332, 28, 8, 0),
(333, 28, 9, 0),
(334, 28, 10, 0),
(335, 28, 11, 0),
(336, 28, 12, 0),
(337, 29, 1, 0),
(338, 29, 2, 0),
(339, 29, 3, 0),
(340, 29, 4, 0),
(341, 29, 5, 0),
(342, 29, 6, 0),
(343, 29, 7, 0),
(344, 29, 8, 0),
(345, 29, 9, 0),
(346, 29, 10, 0),
(347, 29, 11, 0),
(348, 29, 12, 0),
(349, 30, 1, 0),
(350, 30, 2, 0),
(351, 30, 3, 0),
(352, 30, 4, 0),
(353, 30, 5, 0),
(354, 30, 6, 0),
(355, 30, 7, 0),
(356, 30, 8, 0),
(357, 30, 9, 0),
(358, 30, 10, 0),
(359, 30, 11, 0),
(360, 30, 12, 0),
(361, 31, 1, 0),
(362, 31, 2, 0),
(363, 31, 3, 0),
(364, 31, 4, 0),
(365, 31, 5, 0),
(366, 31, 6, 0),
(367, 31, 7, 0),
(368, 31, 8, 0),
(369, 31, 9, 0),
(370, 31, 10, 0),
(371, 31, 11, 0),
(372, 31, 12, 0),
(373, 32, 1, 0),
(374, 32, 2, 0),
(375, 32, 3, 0),
(376, 32, 4, 0),
(377, 32, 5, 0),
(378, 32, 6, 0),
(379, 32, 7, 0),
(380, 32, 8, 0),
(381, 32, 9, 0),
(382, 32, 10, 0),
(383, 32, 11, 0),
(384, 32, 12, 0),
(385, 33, 1, 0),
(386, 33, 2, 0),
(387, 33, 3, 0),
(388, 33, 4, 0),
(389, 33, 5, 0),
(390, 33, 6, 0),
(391, 33, 7, 0),
(392, 33, 8, 0),
(393, 33, 9, 0),
(394, 33, 10, 0),
(395, 33, 11, 0),
(396, 33, 12, 0),
(397, 34, 1, 0),
(398, 34, 2, 0),
(399, 34, 3, 0),
(400, 34, 4, 0),
(401, 34, 5, 0),
(402, 34, 6, 0),
(403, 34, 7, 0),
(404, 34, 8, 0),
(405, 34, 9, 0),
(406, 34, 10, 0),
(407, 34, 11, 0),
(408, 34, 12, 0),
(409, 35, 1, 0),
(410, 35, 2, 0),
(411, 35, 3, 0),
(412, 35, 4, 0),
(413, 35, 5, 0),
(414, 35, 6, 0),
(415, 35, 7, 0),
(416, 35, 8, 0),
(417, 35, 9, 0),
(418, 35, 10, 0),
(419, 35, 11, 0),
(420, 35, 12, 0),
(421, 36, 1, 0),
(422, 36, 2, 0),
(423, 36, 3, 0),
(424, 36, 4, 0),
(425, 36, 5, 0),
(426, 36, 6, 0),
(427, 36, 7, 0),
(428, 36, 8, 0),
(429, 36, 9, 0),
(430, 36, 10, 0),
(431, 36, 11, 0),
(432, 36, 12, 0),
(433, 37, 1, 0),
(434, 37, 2, 0),
(435, 37, 3, 0),
(436, 37, 4, 0),
(437, 37, 5, 0),
(438, 37, 6, 0),
(439, 37, 7, 0),
(440, 37, 8, 0),
(441, 37, 9, 0),
(442, 37, 10, 0),
(443, 37, 11, 0),
(444, 37, 12, 0),
(445, 38, 1, 0),
(446, 38, 2, 0),
(447, 38, 3, 0),
(448, 38, 4, 0),
(449, 38, 5, 0),
(450, 38, 6, 0),
(451, 38, 7, 0),
(452, 38, 8, 0),
(453, 38, 9, 0),
(454, 38, 10, 0),
(455, 38, 11, 0),
(456, 38, 12, 0),
(457, 39, 1, 0),
(458, 39, 2, 0),
(459, 39, 3, 0),
(460, 39, 4, 0),
(461, 39, 5, 0),
(462, 39, 6, 0),
(463, 39, 7, 0),
(464, 39, 8, 0),
(465, 39, 9, 0),
(466, 39, 10, 0),
(467, 39, 11, 0),
(468, 39, 12, 0),
(469, 40, 1, 0),
(470, 40, 2, 0),
(471, 40, 3, 0),
(472, 40, 4, 0),
(473, 40, 5, 0),
(474, 40, 6, 0),
(475, 40, 7, 0),
(476, 40, 8, 0),
(477, 40, 9, 0),
(478, 40, 10, 0),
(479, 40, 11, 0),
(480, 40, 12, 0),
(481, 41, 1, 0),
(482, 42, 1, 0),
(483, 43, 1, 0),
(484, 44, 1, 0),
(485, 45, 1, 0),
(486, 46, 1, 0),
(487, 47, 1, 0),
(488, 48, 1, 0),
(489, 49, 1, 0),
(490, 50, 1, 0),
(491, 51, 1, 0),
(492, 52, 1, 0),
(493, 53, 1, 0),
(494, 54, 1, 0),
(495, 55, 1, 0),
(496, 56, 1, 0);

-- --------------------------------------------------------

--
-- Table structure for table `dprtmnt_table`
--

CREATE TABLE `dprtmnt_table` (
  `dprtmnt_id` int(11) NOT NULL,
  `dprtmnt_name` varchar(255) DEFAULT NULL,
  `dprtmnt_code` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `dprtmnt_table`
--

INSERT INTO `dprtmnt_table` (`dprtmnt_id`, `dprtmnt_name`, `dprtmnt_code`) VALUES
(1, 'College of Architecture and Fine Arts', 'CAFA'),
(2, 'College of Arts and Sciences', 'CAS'),
(3, 'College of Business and Public Administration', 'CBPA'),
(4, 'College of Criminal Justice Education', 'CCJE'),
(5, 'College of Computing Studies', 'CCS'),
(6, 'College of Education', 'CED'),
(7, 'College of Engineering', 'CEN'),
(8, 'College of Hospitality and Tourism Management', 'CHTM'),
(9, 'College of Industrial Technology', 'CIT'),
(10, 'Graduate School Doctoral Program', 'GSDP'),
(11, 'Graduate School Master Program', 'GSMP');

-- --------------------------------------------------------

--
-- Table structure for table `enrolled_subject`
--

CREATE TABLE `enrolled_subject` (
  `id` int(11) NOT NULL,
  `student_number` varchar(255) NOT NULL,
  `curriculum_id` int(11) DEFAULT NULL,
  `course_id` int(11) DEFAULT NULL,
  `active_school_year_id` int(11) DEFAULT NULL,
  `midterm` int(11) NOT NULL DEFAULT 0,
  `finals` int(11) NOT NULL DEFAULT 0,
  `final_grade` varchar(255) NOT NULL DEFAULT '0.00',
  `en_remarks` int(11) NOT NULL DEFAULT 0,
  `department_section_id` int(11) NOT NULL,
  `status` int(11) NOT NULL DEFAULT 0,
  `fe_status` int(11) NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `enrolled_subject`
--

INSERT INTO `enrolled_subject` (`id`, `student_number`, `curriculum_id`, `course_id`, `active_school_year_id`, `midterm`, `finals`, `final_grade`, `en_remarks`, `department_section_id`, `status`, `fe_status`, `created_at`) VALUES
(613, '202500060', 1, 1, 12, 0, 0, '0', 0, 2, 1, 0, '2025-09-17 08:51:48'),
(614, '202500060', 1, 2, 12, 0, 0, '0', 0, 2, 1, 0, '2025-09-17 08:51:48'),
(615, '202500060', 1, 3, 12, 0, 0, '0', 0, 2, 1, 0, '2025-09-17 08:51:48'),
(616, '202500060', 1, 4, 12, 0, 0, '0', 0, 2, 1, 0, '2025-09-17 08:51:48'),
(617, '202500060', 1, 5, 12, 90, 90, '90.00', 1, 2, 1, 0, '2025-09-17 08:51:48'),
(618, '202500060', 1, 6, 12, 0, 0, '0', 0, 2, 1, 0, '2025-09-17 08:51:48'),
(619, '202500060', 1, 7, 12, 0, 0, '0', 0, 2, 1, 0, '2025-09-17 08:51:48'),
(620, '202500060', 1, 8, 12, 0, 0, '0', 0, 2, 1, 0, '2025-09-17 08:51:48'),
(621, '202500060', 1, 9, 12, 0, 0, '0', 0, 2, 1, 0, '2025-09-17 08:51:48'),
(622, '202500060', 1, 10, 12, 0, 0, '0', 0, 2, 1, 0, '2025-09-17 08:51:48'),
(623, '202500060', 1, 11, 12, 0, 0, '0', 0, 2, 1, 0, '2025-09-17 08:51:48'),
(624, '202500002', 1, 1, 12, 0, 0, '0', 0, 1, 1, 0, '2025-09-17 08:51:48'),
(625, '202500002', 1, 11, 12, 0, 0, '0', 0, 1, 1, 0, '2025-09-17 08:51:48'),
(626, '202500002', 1, 2, 12, 0, 0, '0', 0, 1, 1, 0, '2025-09-17 08:51:48'),
(627, '202500002', 1, 4, 12, 0, 0, '0', 0, 1, 1, 0, '2025-09-17 08:51:48'),
(628, '202500002', 1, 3, 12, 0, 0, '0', 0, 1, 1, 0, '2025-09-17 08:51:48'),
(629, '202500002', 1, 5, 12, 0, 0, '0', 0, 1, 1, 0, '2025-09-17 08:51:48'),
(630, '202500002', 1, 6, 12, 0, 0, '0', 0, 1, 1, 0, '2025-09-17 08:51:48'),
(631, '202500002', 1, 7, 12, 0, 0, '0', 0, 1, 1, 0, '2025-09-17 08:51:48'),
(632, '202500002', 1, 8, 12, 0, 0, '0', 0, 1, 1, 0, '2025-09-17 08:51:48'),
(633, '202500002', 1, 9, 12, 0, 0, '0', 0, 1, 1, 0, '2025-09-17 08:51:48'),
(634, '202500002', 1, 10, 12, 0, 0, '0', 0, 1, 1, 0, '2025-09-17 08:51:48'),
(647, '202500306', 1, 1, 12, 0, 0, '0', 0, 1, 1, 0, '2025-09-17 08:51:48'),
(648, '202500306', 1, 3, 12, 0, 0, '0', 0, 1, 1, 0, '2025-09-17 08:51:48'),
(649, '202500306', 1, 2, 12, 0, 0, '0', 0, 1, 1, 0, '2025-09-17 08:51:48'),
(650, '202500306', 1, 6, 12, 0, 0, '0', 0, 1, 1, 0, '2025-09-17 08:51:48'),
(651, '202500306', 1, 4, 12, 0, 0, '0', 0, 1, 1, 0, '2025-09-17 08:51:48'),
(652, '202500306', 1, 5, 12, 0, 0, '0', 0, 1, 1, 0, '2025-09-17 08:51:48'),
(653, '202500306', 1, 7, 12, 0, 0, '0', 0, 1, 1, 0, '2025-09-17 08:51:48'),
(654, '202500306', 1, 8, 12, 0, 0, '0', 0, 1, 1, 0, '2025-09-17 08:51:48'),
(655, '202500306', 1, 9, 12, 0, 0, '0', 0, 1, 1, 0, '2025-09-17 08:51:48'),
(656, '202500306', 1, 11, 12, 0, 0, '0', 0, 1, 1, 0, '2025-09-17 08:51:48'),
(657, '202500306', 1, 10, 12, 0, 0, '0', 0, 1, 1, 0, '2025-09-17 08:51:48'),
(669, '202500001', 1, 1, 12, 0, 0, '0.00', 0, 1, 1, 0, '2025-09-17 08:51:48'),
(670, '202500001', 1, 11, 12, 0, 0, '0.00', 0, 1, 1, 0, '2025-09-17 08:51:48'),
(671, '202500001', 1, 10, 12, 0, 0, '0.00', 0, 1, 1, 0, '2025-09-17 08:51:48'),
(672, '202500001', 1, 2, 12, 0, 0, '0.00', 0, 1, 1, 0, '2025-09-17 08:51:48'),
(673, '202500001', 1, 3, 12, 0, 0, '0.00', 0, 1, 1, 0, '2025-09-17 08:51:48'),
(674, '202500001', 1, 4, 12, 0, 0, '0.00', 0, 1, 1, 0, '2025-09-17 08:51:48'),
(675, '202500001', 1, 5, 12, 0, 0, '0.00', 0, 1, 1, 0, '2025-09-17 08:51:48'),
(676, '202500001', 1, 6, 12, 0, 0, '0.00', 0, 1, 1, 0, '2025-09-17 08:51:48'),
(677, '202500001', 1, 7, 12, 0, 0, '0.00', 0, 1, 1, 0, '2025-09-17 08:51:48'),
(678, '202500001', 1, 8, 12, 0, 0, '0.00', 0, 1, 1, 0, '2025-09-17 08:51:48'),
(679, '202500001', 1, 9, 12, 0, 0, '0.00', 0, 1, 1, 0, '2025-09-17 08:51:48'),
(680, '224-06342M', 3, 54, 3, 0, 0, '1.25', 1, 0, 0, 0, '2025-09-29 07:32:40'),
(681, '224-06342M', 3, 53, 3, 0, 0, '2', 1, 0, 0, 0, '2025-09-29 07:32:40'),
(682, '224-06342M', 3, 46, 3, 0, 0, '1.5', 1, 0, 0, 0, '2025-09-29 07:32:40'),
(683, '224-06342M', 3, 50, 3, 0, 0, '1', 1, 0, 0, 0, '2025-09-29 07:32:40'),
(684, '224-06342M', 3, 49, 3, 0, 0, '1', 1, 0, 0, 0, '2025-09-29 07:32:40'),
(685, '224-06342M', 3, 56, 3, 0, 0, '1.25', 1, 0, 0, 0, '2025-09-29 07:32:40'),
(686, '224-06342M', 3, 55, 3, 0, 0, '1.25', 1, 0, 0, 0, '2025-09-29 07:32:40'),
(687, '224-06342M', 3, 51, 3, 0, 0, '1', 1, 0, 0, 0, '2025-09-29 07:32:40'),
(688, '224-06342M', 3, 52, 3, 0, 0, '1', 1, 0, 0, 0, '2025-09-29 07:32:40'),
(689, '224-06342M', 3, 48, 3, 0, 0, '1', 1, 0, 0, 0, '2025-09-29 07:32:40'),
(690, '224-06342M', 3, 47, 3, 0, 0, '1', 1, 0, 0, 0, '2025-09-29 07:32:40'),
(691, '224-06342M', 3, 58, 2, 0, 0, '1.5', 1, 0, 0, 0, '2025-09-29 07:32:40'),
(692, '224-06342M', 3, 57, 2, 0, 0, '1.75', 1, 0, 0, 0, '2025-09-29 07:32:40'),
(693, '224-06342M', 3, 66, 2, 0, 0, '1', 1, 0, 0, 0, '2025-09-29 07:32:40'),
(694, '224-06342M', 3, 65, 2, 0, 0, '1', 1, 0, 0, 0, '2025-09-29 07:32:40'),
(695, '224-06342M', 3, 60, 2, 0, 0, '1.25', 1, 0, 0, 0, '2025-09-29 07:32:40'),
(696, '224-06342M', 3, 62, 2, 0, 0, '1', 1, 0, 0, 0, '2025-09-29 07:32:40'),
(697, '224-06342M', 3, 61, 2, 0, 0, '1', 1, 0, 0, 0, '2025-09-29 07:32:40'),
(698, '224-06342M', 3, 64, 2, 0, 0, '1', 1, 0, 0, 0, '2025-09-29 07:32:40'),
(699, '224-06342M', 3, 63, 2, 0, 0, '1', 1, 0, 0, 0, '2025-09-29 07:32:40'),
(700, '224-06342M', 3, 59, 2, 0, 0, '1.75', 1, 0, 0, 0, '2025-09-29 07:32:40'),
(701, '224-06342M', 3, 67, 16, 0, 0, '0', 0, 0, 0, 0, '2025-09-29 07:32:40'),
(702, '224-06342M', 3, 73, 16, 0, 0, '0', 0, 0, 0, 0, '2025-09-29 07:32:40'),
(703, '224-06342M', 3, 72, 16, 0, 0, '0', 0, 0, 0, 0, '2025-09-29 07:32:40'),
(704, '224-06342M', 3, 70, 16, 0, 0, '0', 0, 0, 0, 0, '2025-09-29 07:32:40'),
(705, '224-06342M', 3, 71, 16, 0, 0, '0', 0, 0, 0, 0, '2025-09-29 07:32:40'),
(706, '224-06342M', 3, 76, 16, 0, 0, '0', 0, 0, 0, 0, '2025-09-29 07:32:40'),
(707, '224-06342M', 3, 75, 16, 0, 0, '0', 0, 0, 0, 0, '2025-09-29 07:32:40'),
(708, '224-06342M', 3, 74, 16, 0, 0, '0', 0, 0, 0, 0, '2025-09-29 07:32:40'),
(709, '224-06342M', 3, 68, 16, 0, 0, '0', 0, 0, 0, 0, '2025-09-29 07:32:41'),
(710, '224-06342M', 3, 69, 16, 0, 0, '0', 0, 0, 0, 0, '2025-09-29 07:32:41'),
(711, '202500001', 1, 3, 16, 0, 0, '0.00', 0, 6, 1, 0, '2025-09-30 04:47:10'),
(712, '202500001', 1, 5, 16, 0, 0, '0.00', 0, 6, 1, 0, '2025-09-30 04:47:10'),
(713, '202500001', 1, 7, 16, 0, 0, '0.00', 0, 6, 1, 0, '2025-09-30 04:47:10'),
(714, '202500001', 1, 6, 16, 0, 0, '0.00', 0, 6, 1, 0, '2025-09-30 04:47:10'),
(715, '202500001', 1, 1, 16, 0, 0, '0.00', 0, 6, 1, 0, '2025-09-30 04:47:10'),
(716, '202500001', 1, 4, 16, 0, 0, '0.00', 0, 6, 1, 0, '2025-09-30 04:47:10'),
(717, '202500001', 1, 8, 16, 0, 0, '0.00', 0, 6, 1, 0, '2025-09-30 04:47:10'),
(718, '202500001', 1, 9, 16, 0, 0, '0.00', 0, 6, 1, 0, '2025-09-30 04:47:10'),
(719, '202500001', 1, 11, 16, 0, 0, '0.00', 0, 6, 1, 0, '2025-09-30 04:47:10'),
(720, '202500001', 1, 10, 16, 0, 0, '0.00', 0, 6, 1, 0, '2025-09-30 04:47:10'),
(721, '202500001', 1, 2, 16, 0, 0, '0.00', 0, 6, 1, 0, '2025-09-30 04:47:10'),
(722, '202500001', 1, 12, 4, 0, 0, '0.00', 0, 7, 1, 0, '2025-09-30 04:50:48'),
(723, '202500001', 1, 13, 4, 0, 0, '0.00', 0, 7, 1, 0, '2025-09-30 04:50:48'),
(724, '202500001', 1, 14, 4, 0, 0, '0.00', 0, 7, 1, 0, '2025-09-30 04:50:48'),
(725, '202500001', 1, 15, 4, 0, 0, '0.00', 0, 7, 1, 0, '2025-09-30 04:50:48'),
(726, '202500001', 1, 16, 4, 0, 0, '0.00', 0, 7, 1, 0, '2025-09-30 04:50:48'),
(727, '202500001', 1, 17, 4, 0, 0, '0.00', 0, 7, 1, 0, '2025-09-30 04:50:48'),
(728, '202500001', 1, 18, 4, 0, 0, '0.00', 0, 7, 1, 0, '2025-09-30 04:50:48'),
(729, '202500001', 1, 19, 4, 0, 0, '0.00', 0, 7, 1, 0, '2025-09-30 04:50:48'),
(730, '202500001', 1, 21, 4, 0, 0, '0.00', 0, 7, 1, 0, '2025-09-30 04:50:48'),
(731, '202500001', 1, 20, 4, 0, 0, '0.00', 0, 7, 1, 0, '2025-09-30 04:50:48'),
(732, '202500001', 1, 22, 4, 0, 0, '0.00', 0, 7, 1, 0, '2025-09-30 04:50:48');

-- --------------------------------------------------------

--
-- Table structure for table `evaluation_table`
--

CREATE TABLE `evaluation_table` (
  `id` int(11) NOT NULL,
  `school_year_id` int(11) NOT NULL DEFAULT 0,
  `question_id` int(11) NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `evaluation_table`
--

INSERT INTO `evaluation_table` (`id`, `school_year_id`, `question_id`, `created_at`) VALUES
(1, 16, 7, '2025-10-12 08:27:08'),
(2, 16, 8, '2025-10-12 08:37:44'),
(3, 16, 9, '2025-10-12 11:25:59');

-- --------------------------------------------------------

--
-- Table structure for table `medical_requirements`
--

CREATE TABLE `medical_requirements` (
  `id` int(11) NOT NULL,
  `person_id` int(11) NOT NULL,
  `student_number` varchar(50) DEFAULT NULL,
  `age_onset` varchar(50) DEFAULT NULL,
  `genital_enlargement` varchar(50) DEFAULT NULL,
  `pubic_hair` varchar(50) DEFAULT NULL,
  `height` varchar(50) DEFAULT NULL,
  `weight` varchar(50) DEFAULT NULL,
  `bmi` varchar(50) DEFAULT NULL,
  `interpretation` varchar(100) DEFAULT NULL,
  `heart_rate` varchar(50) DEFAULT NULL,
  `respiratory_rate` varchar(50) DEFAULT NULL,
  `o2_saturation` varchar(50) DEFAULT NULL,
  `blood_pressure` varchar(50) DEFAULT NULL,
  `vision_acuity` varchar(100) DEFAULT NULL,
  `general_survey` varchar(255) DEFAULT NULL,
  `skin` varchar(255) DEFAULT NULL,
  `eyes` varchar(255) DEFAULT NULL,
  `ent` varchar(255) DEFAULT NULL,
  `neck` varchar(255) DEFAULT NULL,
  `heart` varchar(255) DEFAULT NULL,
  `chest_lungs` varchar(255) DEFAULT NULL,
  `abdomen` varchar(255) DEFAULT NULL,
  `musculoskeletal` varchar(255) DEFAULT NULL,
  `breast_exam` varchar(255) DEFAULT NULL,
  `genitalia_smr` varchar(255) DEFAULT NULL,
  `penis` varchar(255) DEFAULT NULL,
  `dental_general_condition` varchar(100) DEFAULT NULL,
  `dental_good_hygiene` tinyint(1) DEFAULT 0,
  `dental_presence_of_calculus_plaque` tinyint(1) DEFAULT 0,
  `dental_gingivitis` tinyint(1) DEFAULT 0,
  `dental_denture_wearer_up` tinyint(1) DEFAULT 0,
  `dental_denture_wearer_down` tinyint(1) DEFAULT 0,
  `dental_with_braces_up` tinyint(1) DEFAULT 0,
  `dental_with_braces_down` tinyint(1) DEFAULT 0,
  `dental_with_oral_hygiene_reliner` tinyint(1) DEFAULT 0,
  `dental_diabetes` tinyint(1) DEFAULT 0,
  `dental_hypertension` tinyint(1) DEFAULT 0,
  `dental_allergies` tinyint(1) DEFAULT 0,
  `dental_heart_disease` tinyint(1) DEFAULT 0,
  `dental_epilepsy` tinyint(1) DEFAULT 0,
  `dental_mental_illness` tinyint(1) DEFAULT 0,
  `dental_clotting_disorder` tinyint(1) DEFAULT 0,
  `dental_upper_right` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`dental_upper_right`)),
  `dental_upper_left` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`dental_upper_left`)),
  `dental_lower_right` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`dental_lower_right`)),
  `dental_lower_left` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`dental_lower_left`)),
  `pne_mental_status_check` tinyint(1) DEFAULT 0,
  `pne_mental_status_text` varchar(255) DEFAULT NULL,
  `pne_sensory_check` tinyint(1) DEFAULT 0,
  `pne_sensory_text` varchar(255) DEFAULT NULL,
  `pne_cranial_nerve_check` tinyint(1) DEFAULT 0,
  `pne_cranial_nerve_text` varchar(255) DEFAULT NULL,
  `pne_cerebellar_check` tinyint(1) DEFAULT 0,
  `pne_cerebellar_text` varchar(255) DEFAULT NULL,
  `pne_motor_check` tinyint(1) DEFAULT 0,
  `pne_motor_text` varchar(255) DEFAULT NULL,
  `pne_reflexes_check` tinyint(1) DEFAULT 0,
  `pne_reflexes_text` varchar(255) DEFAULT NULL,
  `pne_findings_psychological` text DEFAULT NULL,
  `pne_recommendations` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `medical_requirements`
--

INSERT INTO `medical_requirements` (`id`, `person_id`, `student_number`, `age_onset`, `genital_enlargement`, `pubic_hair`, `height`, `weight`, `bmi`, `interpretation`, `heart_rate`, `respiratory_rate`, `o2_saturation`, `blood_pressure`, `vision_acuity`, `general_survey`, `skin`, `eyes`, `ent`, `neck`, `heart`, `chest_lungs`, `abdomen`, `musculoskeletal`, `breast_exam`, `genitalia_smr`, `penis`, `dental_general_condition`, `dental_good_hygiene`, `dental_presence_of_calculus_plaque`, `dental_gingivitis`, `dental_denture_wearer_up`, `dental_denture_wearer_down`, `dental_with_braces_up`, `dental_with_braces_down`, `dental_with_oral_hygiene_reliner`, `dental_diabetes`, `dental_hypertension`, `dental_allergies`, `dental_heart_disease`, `dental_epilepsy`, `dental_mental_illness`, `dental_clotting_disorder`, `dental_upper_right`, `dental_upper_left`, `dental_lower_right`, `dental_lower_left`, `pne_mental_status_check`, `pne_mental_status_text`, `pne_sensory_check`, `pne_sensory_text`, `pne_cranial_nerve_check`, `pne_cranial_nerve_text`, `pne_cerebellar_check`, `pne_cerebellar_text`, `pne_motor_check`, `pne_motor_text`, `pne_reflexes_check`, `pne_reflexes_text`, `pne_findings_psychological`, `pne_recommendations`, `created_at`, `updated_at`) VALUES
(3, 1, '202500001', '22', '25', '56', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', NULL, 1, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, '[\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\"]', '[\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\"]', '[\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\"]', '[\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\"]', 1, 'bad eyesight', 1, NULL, 1, NULL, 1, NULL, 1, NULL, 1, NULL, 'Ongoing', NULL, '2025-10-09 21:51:30', '2025-10-20 16:31:54'),
(5, 0, '202500002', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, NULL, NULL, NULL, NULL, 0, NULL, 0, NULL, 0, NULL, 0, NULL, 0, NULL, 0, NULL, NULL, NULL, '2025-10-15 09:34:07', '2025-10-15 09:34:07'),
(6, 0, '202500003', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, NULL, NULL, NULL, NULL, 0, NULL, 0, NULL, 0, NULL, 0, NULL, 0, NULL, 0, NULL, NULL, NULL, '2025-10-15 09:34:12', '2025-10-15 09:34:12'),
(7, 0, '202500004', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, NULL, NULL, NULL, NULL, 0, NULL, 0, NULL, 0, NULL, 0, NULL, 0, NULL, 0, NULL, NULL, NULL, '2025-10-15 09:34:16', '2025-10-15 09:34:16'),
(8, 0, '2025000001', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, NULL, NULL, NULL, NULL, 0, NULL, 0, NULL, 0, NULL, 0, NULL, 0, NULL, 0, NULL, NULL, NULL, '2025-10-21 09:07:37', '2025-10-21 09:07:37'),
(9, 0, ' PHYSICAL AND NEUROLOGICAL EXAMINATION', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, NULL, NULL, NULL, NULL, 0, NULL, 0, NULL, 0, NULL, 0, NULL, 0, NULL, 0, NULL, NULL, NULL, '2025-10-21 09:08:10', '2025-10-21 09:08:10');

-- --------------------------------------------------------

--
-- Table structure for table `page_access`
--

CREATE TABLE `page_access` (
  `id` int(11) NOT NULL,
  `page_privilege` tinyint(1) NOT NULL,
  `page_id` int(11) DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `page_access`
--

INSERT INTO `page_access` (`id`, `page_privilege`, `page_id`, `user_id`) VALUES
(30, 1, 6, 61),
(32, 1, 2, 61),
(33, 1, 1, 61),
(34, 1, 3, 61),
(35, 1, 5, 61),
(36, 1, 4, 61),
(37, 1, 7, 61),
(38, 1, 8, 61),
(39, 1, 9, 61),
(40, 1, 10, 61),
(41, 1, 11, 61),
(42, 1, 12, 61),
(43, 1, 13, 61),
(44, 1, 14, 61),
(45, 1, 15, 61),
(46, 1, 16, 61),
(47, 1, 17, 61),
(48, 1, 18, 61),
(49, 1, 19, 61),
(50, 1, 20, 61),
(51, 1, 21, 61),
(52, 1, 22, 61),
(53, 1, 23, 61),
(54, 1, 24, 61),
(55, 1, 25, 61),
(56, 1, 26, 61),
(57, 1, 27, 61),
(58, 1, 29, 61),
(59, 1, 28, 61),
(60, 1, 30, 61),
(61, 1, 31, 61),
(62, 1, 32, 61),
(63, 1, 33, 61),
(64, 1, 34, 61),
(65, 1, 35, 61),
(66, 1, 36, 61),
(67, 1, 37, 61);

-- --------------------------------------------------------

--
-- Table structure for table `page_table`
--

CREATE TABLE `page_table` (
  `id` int(11) NOT NULL,
  `page_description` varchar(255) NOT NULL,
  `page_group` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `page_table`
--

INSERT INTO `page_table` (`id`, `page_description`, `page_group`, `created_at`) VALUES
(1, 'Admin Dashboard - Personal Information', 'registrar', '2025-10-23 06:27:49'),
(2, 'Admin Dashboard - Family Background', 'registrar', '2025-10-23 06:26:47'),
(3, 'Admin Dashboard - Educational Attainment', 'registrar', '2025-10-23 06:31:17'),
(4, 'Admin Dashboard - Health Medical ', 'registrar', '2025-10-23 06:36:22'),
(5, 'Admin Dashboard - Other Information', 'registrar', '2025-10-23 06:38:11'),
(6, 'Admin ECAT Application Form', 'registrar', '2025-10-23 06:39:18'),
(7, 'Admin Office of the Registrar', 'registrar', '2025-10-23 06:39:48'),
(8, 'Admin Personal Data Form', 'registrar', '2025-10-23 06:40:03'),
(9, 'Applicant List', 'registrar', '2025-10-23 06:40:12'),
(10, 'Applicant List Admin', 'registrar', '2025-10-23 06:40:24'),
(11, 'Applicant Scoring', 'registrar', '2025-10-23 06:40:47'),
(12, 'Assign Entrance Exam', 'registrar', '2025-10-23 06:40:59'),
(13, 'Assign Interview Exam', 'registrar', '2025-10-23 06:41:15'),
(14, 'Assign Schedule to Applicants', 'registrar', '2025-10-23 06:41:27'),
(15, 'Assign Schedule to Applicants Interviewer', 'registrar', '2025-10-23 06:41:56'),
(16, 'COR for registrar', 'registrar', '2025-10-23 06:42:09'),
(17, 'Change Year Grad Per', 'registrar', '2025-10-23 06:42:26'),
(18, 'Class Roster', 'registrar', '2025-10-23 06:42:40'),
(19, 'Course Panel', 'registrar', '2025-10-23 06:42:50'),
(20, 'Course Tagging', 'registrar', '2025-10-23 06:42:59'),
(21, 'Curriculum Panel', 'registrar', '2025-10-23 06:43:10'),
(22, 'Dental Assessment', 'registrar', '2025-10-23 06:43:23'),
(23, 'Department Section', 'registrar', '2025-10-23 06:43:40'),
(24, 'Department Registration', 'registrar', '2025-10-23 06:44:12'),
(25, 'Department Room', 'registrar', '2025-10-23 06:44:20'),
(26, 'Evaluation CRUD', 'registrar', '2025-10-23 06:44:34'),
(27, 'Examination Profile', 'registrar', '2025-10-23 06:44:45'),
(28, 'Health Record', 'registrar', '2025-10-23 06:44:55'),
(29, 'Interviewer Applicant List', 'registrar', '2025-10-23 06:45:07'),
(30, 'Medical Applicant List', 'registrar', '2025-10-23 06:45:19'),
(31, 'Medical Certificate', 'registrar', '2025-10-23 06:45:32'),
(32, 'Medical Dashboard - Personal Information', 'registrar', '2025-10-23 06:45:52'),
(33, 'Medical Dashboard - Family Background', 'registrar', '2025-10-30 01:02:49'),
(34, 'Medical Dashboard - Educational Attainment', 'registrar', '2025-10-30 01:02:49'),
(35, 'Medical Dashboard - Health Medical Records', 'registrar', '2025-10-30 01:03:31'),
(36, 'Medical Dashboard - Other Information', 'registrar\r\n', '2025-10-30 01:03:31'),
(37, 'Medical Requirements', 'registrar', '2025-10-30 01:06:17'),
(38, 'Medical Requirements Form', 'registrar', '2025-10-30 01:06:17'),
(39, 'Notifications', 'registrar', '2025-10-30 01:07:04'),
(40, 'Physical Neuro Exam', 'registrar', '2025-10-30 01:07:04'),
(41, 'Proctor Applicant List', 'registrar', '2025-10-30 01:07:52');

-- --------------------------------------------------------

--
-- Table structure for table `period_status`
--

CREATE TABLE `period_status` (
  `id` int(11) NOT NULL,
  `description` varchar(255) NOT NULL,
  `status` int(11) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `period_status`
--

INSERT INTO `period_status` (`id`, `description`, `status`) VALUES
(1, 'Midterm', 1),
(2, 'Finals', 0),
(3, 'Final Grading Period', 0);

-- --------------------------------------------------------

--
-- Table structure for table `person_prof_table`
--

CREATE TABLE `person_prof_table` (
  `person_id` int(11) NOT NULL,
  `bachelor` varchar(255) DEFAULT NULL,
  `master` varchar(255) DEFAULT NULL,
  `doctor` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `person_prof_table`
--

INSERT INTO `person_prof_table` (`person_id`, `bachelor`, `master`, `doctor`) VALUES
(1, NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `person_status_table`
--

CREATE TABLE `person_status_table` (
  `id` int(11) NOT NULL,
  `person_id` int(11) DEFAULT NULL,
  `exam_status` int(11) DEFAULT NULL,
  `requirements` int(11) DEFAULT NULL,
  `residency` int(11) DEFAULT NULL,
  `student_registration_status` int(11) DEFAULT NULL,
  `exam_result` int(11) DEFAULT NULL,
  `hs_ave` float DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `person_status_table`
--

INSERT INTO `person_status_table` (`id`, `person_id`, `exam_status`, `requirements`, `residency`, `student_registration_status`, `exam_result`, `hs_ave`) VALUES
(4, 1, 0, 0, 0, 1, 0, 0),
(5, 2, 0, 0, 0, 1, 0, 0),
(6, 3, 0, 0, 0, 1, 0, 0),
(7, 4, 0, 0, 0, 1, 0, 0),
(8, 5, 0, 0, 0, 1, 0, 0),
(9, 306, 0, 0, 0, 1, 0, 0),
(10, 307, 0, 0, 0, 1, 0, 0),
(11, 309, 0, 0, 0, 1, 0, 0),
(12, 323, 0, 0, 0, 1, 0, 0);

-- --------------------------------------------------------

--
-- Table structure for table `person_table`
--

CREATE TABLE `person_table` (
  `person_id` int(11) NOT NULL,
  `student_number` varchar(255) DEFAULT NULL,
  `profile_img` varchar(255) DEFAULT NULL,
  `campus` int(11) DEFAULT NULL,
  `academicProgram` varchar(100) DEFAULT NULL,
  `classifiedAs` varchar(50) DEFAULT NULL,
  `applyingAs` varchar(100) DEFAULT NULL,
  `program` varchar(100) DEFAULT NULL,
  `program2` varchar(100) DEFAULT NULL,
  `program3` varchar(100) DEFAULT NULL,
  `yearLevel` varchar(30) DEFAULT NULL,
  `last_name` varchar(100) DEFAULT NULL,
  `first_name` varchar(100) DEFAULT NULL,
  `middle_name` varchar(100) DEFAULT NULL,
  `extension` varchar(10) DEFAULT NULL,
  `nickname` varchar(50) DEFAULT NULL,
  `height` varchar(10) DEFAULT NULL,
  `weight` varchar(10) DEFAULT NULL,
  `lrnNumber` varchar(20) DEFAULT NULL,
  `nolrnNumber` int(5) DEFAULT NULL,
  `gender` int(11) DEFAULT NULL,
  `pwdMember` int(5) DEFAULT NULL,
  `pwdType` varchar(50) DEFAULT NULL,
  `pwdId` varchar(50) DEFAULT NULL,
  `birthOfDate` varchar(50) DEFAULT NULL,
  `age` int(11) DEFAULT NULL,
  `birthPlace` varchar(255) DEFAULT NULL,
  `languageDialectSpoken` varchar(255) DEFAULT NULL,
  `citizenship` varchar(50) DEFAULT NULL,
  `religion` varchar(50) DEFAULT NULL,
  `civilStatus` varchar(50) DEFAULT NULL,
  `tribeEthnicGroup` varchar(50) DEFAULT NULL,
  `cellphoneNumber` varchar(20) DEFAULT NULL,
  `emailAddress` varchar(100) DEFAULT NULL,
  `presentStreet` varchar(255) DEFAULT NULL,
  `presentBarangay` varchar(100) DEFAULT NULL,
  `presentZipCode` varchar(10) DEFAULT NULL,
  `presentRegion` varchar(100) DEFAULT NULL,
  `presentProvince` varchar(100) DEFAULT NULL,
  `presentMunicipality` varchar(100) DEFAULT NULL,
  `presentDswdHouseholdNumber` varchar(50) DEFAULT NULL,
  `sameAsPresentAddress` int(5) DEFAULT NULL,
  `permanentStreet` varchar(255) DEFAULT NULL,
  `permanentBarangay` varchar(100) DEFAULT NULL,
  `permanentZipCode` varchar(10) DEFAULT NULL,
  `permanentRegion` varchar(75) DEFAULT NULL,
  `permanentProvince` varchar(75) DEFAULT NULL,
  `permanentMunicipality` varchar(75) DEFAULT NULL,
  `permanentDswdHouseholdNumber` varchar(50) DEFAULT NULL,
  `solo_parent` int(5) DEFAULT NULL,
  `father_deceased` int(5) DEFAULT NULL,
  `father_family_name` varchar(100) DEFAULT NULL,
  `father_given_name` varchar(100) DEFAULT NULL,
  `father_middle_name` varchar(100) DEFAULT NULL,
  `father_ext` varchar(10) DEFAULT NULL,
  `father_nickname` varchar(50) DEFAULT NULL,
  `father_education` int(5) NOT NULL,
  `father_education_level` varchar(100) DEFAULT NULL,
  `father_last_school` varchar(100) DEFAULT NULL,
  `father_course` varchar(100) DEFAULT NULL,
  `father_year_graduated` varchar(10) DEFAULT NULL,
  `father_school_address` varchar(255) DEFAULT NULL,
  `father_contact` varchar(20) DEFAULT NULL,
  `father_occupation` varchar(100) DEFAULT NULL,
  `father_employer` varchar(100) DEFAULT NULL,
  `father_income` varchar(20) DEFAULT NULL,
  `father_email` varchar(100) DEFAULT NULL,
  `mother_deceased` int(5) DEFAULT NULL,
  `mother_family_name` varchar(100) DEFAULT NULL,
  `mother_given_name` varchar(100) DEFAULT NULL,
  `mother_middle_name` varchar(100) DEFAULT NULL,
  `mother_ext` varchar(10) DEFAULT NULL,
  `mother_nickname` varchar(50) DEFAULT NULL,
  `mother_education` int(5) NOT NULL,
  `mother_education_level` varchar(100) DEFAULT NULL,
  `mother_last_school` varchar(100) DEFAULT NULL,
  `mother_course` varchar(100) DEFAULT NULL,
  `mother_year_graduated` varchar(10) DEFAULT NULL,
  `mother_school_address` varchar(255) DEFAULT NULL,
  `mother_contact` varchar(20) DEFAULT NULL,
  `mother_occupation` varchar(100) DEFAULT NULL,
  `mother_employer` varchar(100) DEFAULT NULL,
  `mother_income` varchar(20) DEFAULT NULL,
  `mother_email` varchar(100) DEFAULT NULL,
  `guardian` varchar(100) DEFAULT NULL,
  `guardian_family_name` varchar(100) DEFAULT NULL,
  `guardian_given_name` varchar(100) DEFAULT NULL,
  `guardian_middle_name` varchar(100) DEFAULT NULL,
  `guardian_ext` varchar(20) DEFAULT NULL,
  `guardian_nickname` varchar(50) DEFAULT NULL,
  `guardian_address` varchar(255) DEFAULT NULL,
  `guardian_contact` varchar(20) DEFAULT NULL,
  `guardian_email` varchar(100) DEFAULT NULL,
  `annual_income` varchar(50) DEFAULT NULL,
  `schoolLevel` varchar(50) DEFAULT NULL,
  `schoolLastAttended` varchar(100) DEFAULT NULL,
  `schoolAddress` varchar(255) DEFAULT NULL,
  `courseProgram` varchar(100) DEFAULT NULL,
  `honor` varchar(100) DEFAULT NULL,
  `generalAverage` decimal(5,2) DEFAULT NULL,
  `yearGraduated` int(11) DEFAULT NULL,
  `schoolLevel1` varchar(50) DEFAULT NULL,
  `schoolLastAttended1` varchar(100) DEFAULT NULL,
  `schoolAddress1` varchar(255) DEFAULT NULL,
  `courseProgram1` varchar(100) DEFAULT NULL,
  `honor1` varchar(100) DEFAULT NULL,
  `generalAverage1` decimal(5,2) DEFAULT NULL,
  `yearGraduated1` int(11) DEFAULT NULL,
  `strand` varchar(100) DEFAULT NULL,
  `cough` int(11) DEFAULT NULL,
  `colds` int(11) DEFAULT NULL,
  `fever` int(11) DEFAULT NULL,
  `asthma` int(11) DEFAULT NULL,
  `faintingSpells` int(11) DEFAULT NULL,
  `heartDisease` int(11) DEFAULT NULL,
  `tuberculosis` int(11) DEFAULT NULL,
  `frequentHeadaches` int(11) DEFAULT NULL,
  `hernia` int(11) DEFAULT NULL,
  `chronicCough` int(11) DEFAULT NULL,
  `headNeckInjury` int(11) DEFAULT NULL,
  `hiv` int(11) DEFAULT NULL,
  `highBloodPressure` int(11) DEFAULT NULL,
  `diabetesMellitus` int(11) DEFAULT NULL,
  `allergies` int(11) DEFAULT NULL,
  `cancer` int(11) DEFAULT NULL,
  `smokingCigarette` int(11) DEFAULT NULL,
  `alcoholDrinking` int(11) DEFAULT NULL,
  `hospitalized` int(11) DEFAULT NULL,
  `hospitalizationDetails` varchar(255) DEFAULT NULL,
  `medications` varchar(255) DEFAULT NULL,
  `hadCovid` int(11) DEFAULT NULL,
  `covidDate` varchar(50) DEFAULT NULL,
  `vaccine1Brand` varchar(50) DEFAULT NULL,
  `vaccine1Date` varchar(50) DEFAULT NULL,
  `vaccine2Brand` varchar(50) DEFAULT NULL,
  `vaccine2Date` varchar(50) DEFAULT NULL,
  `booster1Brand` varchar(50) DEFAULT NULL,
  `booster1Date` varchar(50) DEFAULT NULL,
  `booster2Brand` varchar(50) DEFAULT NULL,
  `booster2Date` varchar(50) DEFAULT NULL,
  `chestXray` varchar(100) DEFAULT NULL,
  `cbc` varchar(100) DEFAULT NULL,
  `urinalysis` varchar(100) DEFAULT NULL,
  `otherworkups` varchar(255) DEFAULT NULL,
  `symptomsToday` int(11) DEFAULT NULL,
  `remarks` varchar(255) DEFAULT NULL,
  `termsOfAgreement` int(10) DEFAULT NULL,
  `created_at` varchar(100) DEFAULT NULL,
  `current_step` int(11) DEFAULT 1
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci ROW_FORMAT=COMPRESSED;

--
-- Dumping data for table `person_table`
--

INSERT INTO `person_table` (`person_id`, `student_number`, `profile_img`, `campus`, `academicProgram`, `classifiedAs`, `applyingAs`, `program`, `program2`, `program3`, `yearLevel`, `last_name`, `first_name`, `middle_name`, `extension`, `nickname`, `height`, `weight`, `lrnNumber`, `nolrnNumber`, `gender`, `pwdMember`, `pwdType`, `pwdId`, `birthOfDate`, `age`, `birthPlace`, `languageDialectSpoken`, `citizenship`, `religion`, `civilStatus`, `tribeEthnicGroup`, `cellphoneNumber`, `emailAddress`, `presentStreet`, `presentBarangay`, `presentZipCode`, `presentRegion`, `presentProvince`, `presentMunicipality`, `presentDswdHouseholdNumber`, `sameAsPresentAddress`, `permanentStreet`, `permanentBarangay`, `permanentZipCode`, `permanentRegion`, `permanentProvince`, `permanentMunicipality`, `permanentDswdHouseholdNumber`, `solo_parent`, `father_deceased`, `father_family_name`, `father_given_name`, `father_middle_name`, `father_ext`, `father_nickname`, `father_education`, `father_education_level`, `father_last_school`, `father_course`, `father_year_graduated`, `father_school_address`, `father_contact`, `father_occupation`, `father_employer`, `father_income`, `father_email`, `mother_deceased`, `mother_family_name`, `mother_given_name`, `mother_middle_name`, `mother_ext`, `mother_nickname`, `mother_education`, `mother_education_level`, `mother_last_school`, `mother_course`, `mother_year_graduated`, `mother_school_address`, `mother_contact`, `mother_occupation`, `mother_employer`, `mother_income`, `mother_email`, `guardian`, `guardian_family_name`, `guardian_given_name`, `guardian_middle_name`, `guardian_ext`, `guardian_nickname`, `guardian_address`, `guardian_contact`, `guardian_email`, `annual_income`, `schoolLevel`, `schoolLastAttended`, `schoolAddress`, `courseProgram`, `honor`, `generalAverage`, `yearGraduated`, `schoolLevel1`, `schoolLastAttended1`, `schoolAddress1`, `courseProgram1`, `honor1`, `generalAverage1`, `yearGraduated1`, `strand`, `cough`, `colds`, `fever`, `asthma`, `faintingSpells`, `heartDisease`, `tuberculosis`, `frequentHeadaches`, `hernia`, `chronicCough`, `headNeckInjury`, `hiv`, `highBloodPressure`, `diabetesMellitus`, `allergies`, `cancer`, `smokingCigarette`, `alcoholDrinking`, `hospitalized`, `hospitalizationDetails`, `medications`, `hadCovid`, `covidDate`, `vaccine1Brand`, `vaccine1Date`, `vaccine2Brand`, `vaccine2Date`, `booster1Brand`, `booster1Date`, `booster2Brand`, `booster2Date`, `chestXray`, `cbc`, `urinalysis`, `otherworkups`, `symptomsToday`, `remarks`, `termsOfAgreement`, `created_at`, `current_step`) VALUES
(1, '202500001', '2025100001_1by1_2025.jpg', 1, 'Techvoc', 'Freshman (First Year)', 'Master Degree Graduate', '1', '11', '14', 'First Year', 'Montaño', 'Mark Anthony', 'Placido', NULL, 'Johnny', '5\'11', '65kg', '123456789012', 0, 0, 0, NULL, NULL, '2005-10-23', 20, 'Manila, Philippines', 'Tagalog, English', 'FILIPINO', 'Born Again', 'Single', 'Agta', '09171234567999999', 'markmontano999@gmail.com', '19 G Dona Yayang Street ', 'Libis', '1000', 'National Capital Region (NCR)', 'Metro Manila, Second District', 'Quezon City', 'DSWD123456', 0, '19 G Dona Yayang Street ', 'Libis', '1000', 'National Capital Region (NCR)', 'Metro Manila, Second District', 'Quezon City', 'DSWD123456', 0, 0, 'Doe Sr.', 'Jonathan', 'Smiths', 'III', 'Jon', 0, NULL, NULL, NULL, NULL, NULL, '09181234567', 'Engineer', 'ABC Corp', '50000', 'jon.doe@abc.com', 0, 'Jane', 'Mary', 'Anne', NULL, 'Janey', 0, NULL, NULL, NULL, NULL, NULL, '09221234567', 'Accountant', 'XYZ Corp', '100000', 'jane.doe@xyz.com', 'StepFather', 'Parker', 'Ben', 'Jose', 'IV', 'Benny', '789 Recto Av', '09192233445', NULL, '135,000 to 250,000', 'Senior High School', 'CGEAHS', 'Pasig City', 'STEM', 'With Honors', 92.50, 2022, 'Senior High School', 'CGEAHS', 'Rizal High School', 'Rizal High School', '0', 66.00, 0, 'Information and Communications Technology (ICT)', 1, 0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0, 'Wala ngani', 'Vitamins C', 1, '2022-02-11', 'Pfizer', '2022-03-14', 'Pfizer', '2022-04-13', 'Moderna', '2022-07-14', 'Pfizer', '2023-01-14', 'Normal', 'Normal', 'Normal', 'Normal', 1, 'Fit to enroll', 1, '2024-11-08', 1),
(2, '202500002', '3_1by1_2025.jpg', 1, 'Techvoc', 'Freshman (First Year)', 'Senior High School Graduate', '38', '4', '3', 'Second  Year', 'Emily', 'Johnson', 'Grace', '', 'MARK', '5\'11', '65', '123456789012', 0, 0, 0, '', '', '2003-06-26', 21, 'Manila, Philippines', 'Tagalog, English', 'ALGERIAN', 'Iglesia Ni Cristo', 'Single', 'Cebuano', '09953242510', 'emily.johnson2@example.com', '19 G Dona yayang Street Libis', 'Pag-asa', '4100', 'National Capital Region (NCR)', 'Metro Manila, Second District', 'City Of Mandaluyong', 'DSWD123456', 0, '19 G Dona yayang Street Libis', 'Malipayon', '4100', 'Region X (Northern Mindanao)', 'Bukidnon', 'Pangantucan', 'DSWD123456', 0, 0, '', '', '', '', '', 0, '', '', '', '', '', '', '', '', '', '', 0, '', '', '', '', '', 0, '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'fgdsgfasftrasf', '', '', '', 0.00, 0, '', '', '', '', '', 83.00, 0, '', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, '', '', 0, '', '', '', '', '', '', '', '', '', '', '', '', '', 0, '', 0, '2024-12-10', 1),
(60, NULL, NULL, 0, NULL, NULL, NULL, '31', NULL, NULL, NULL, 'Bell', 'Evelyn', 'Faith', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'evelyn.bell60@example.com', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 63.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2024-08-09', 1),
(59, NULL, NULL, 0, NULL, NULL, NULL, '5', NULL, NULL, NULL, 'Morgan', 'Levi', 'Anne', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'levi.morgan59@example.com', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 99.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2023-04-12', 1),
(58, NULL, NULL, 1, NULL, NULL, NULL, '22', NULL, NULL, NULL, 'Cook', 'Zoey', 'Mae', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'zoey.cook58@example.com', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 28.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2022-03-01', 1),
(57, NULL, NULL, 0, NULL, NULL, NULL, '32', NULL, NULL, NULL, 'Reed', 'Nathan', 'John', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'nathan.reed57@example.com', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 29.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-01-08', 1),
(56, NULL, NULL, 0, NULL, NULL, NULL, '53', NULL, NULL, NULL, 'Rogers', 'Layla', 'Joy', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'layla.rogers56@example.com', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 20.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2024-04-23', 1),
(55, NULL, NULL, 0, NULL, NULL, NULL, '28', NULL, NULL, NULL, 'Morris', 'Dylan', 'Faith', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'dylan.morris55@example.com', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 61.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2022-04-30', 1),
(54, NULL, NULL, 1, NULL, NULL, NULL, '20', NULL, NULL, NULL, 'Stewart', 'Penelope', 'Pearl', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'penelope.stewart54@example.com', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 40.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-03-10', 1),
(53, NULL, NULL, 1, NULL, NULL, NULL, '54', NULL, NULL, NULL, 'Collins', 'Isaac', 'Anne', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'isaac.collins53@example.com', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 18.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2024-12-22', 1),
(52, NULL, NULL, 1, NULL, NULL, NULL, '19', NULL, NULL, NULL, 'Edwards', 'Victoria', 'Jean', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'victoria.edwards52@example.com', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 75.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2020-09-01', 1),
(51, NULL, NULL, 0, NULL, NULL, NULL, '30', NULL, NULL, NULL, 'Parker', 'Carter', 'Ruth', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'carter.parker51@example.com', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 32.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2022-09-02', 1),
(50, NULL, NULL, 1, NULL, NULL, NULL, '2', NULL, NULL, NULL, 'Campbell', 'Ella', 'Ruth', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'ella.campbell50@example.com', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 20.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2020-01-25', 1),
(49, NULL, NULL, 0, NULL, NULL, NULL, '19', NULL, NULL, NULL, 'Phillips', 'Gabriel', 'Mae', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'gabriel.phillips49@example.com', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 79.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2022-10-08', 1),
(48, NULL, NULL, 0, NULL, NULL, NULL, '19', NULL, NULL, NULL, 'Turner', 'Sofia', 'Joy', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'sofia.turner48@example.com', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 38.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2023-10-19', 1),
(47, NULL, NULL, 0, NULL, NULL, NULL, '38', NULL, NULL, NULL, 'Evans', 'Jayden', 'Ivy', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'jayden.evans47@example.com', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 48.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2021-01-19', 1),
(46, NULL, NULL, 1, NULL, NULL, NULL, '4', NULL, NULL, NULL, 'Roberts', 'Madison', 'Dawn', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'madison.roberts46@example.com', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 43.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-05-04', 1),
(45, NULL, NULL, 0, NULL, NULL, NULL, '2', NULL, NULL, NULL, 'Perez', 'Luke', 'James', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'luke.perez45@example.com', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 79.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2024-06-22', 1),
(44, NULL, NULL, 1, NULL, NULL, NULL, '9', NULL, NULL, NULL, 'Mitchell', 'Abigail', 'Faith', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'abigail.mitchell44@example.com', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 46.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2022-12-05', 1),
(43, NULL, NULL, 1, NULL, NULL, NULL, '49', NULL, NULL, NULL, 'Carter', 'Wyatt', 'Dean', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'wyatt.carter43@example.com', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 8.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2020-03-17', 1),
(42, NULL, NULL, 1, NULL, NULL, NULL, '43', NULL, NULL, NULL, 'Nelson', 'Hannah', 'George', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'hannah.nelson42@example.com', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 7.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2022-04-02', 1),
(41, NULL, NULL, 1, NULL, NULL, NULL, '6', NULL, NULL, NULL, 'Gonzalez', 'Owen', 'Louise', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'owen.gonzalez41@example.com', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 90.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-04-29', 1),
(40, NULL, NULL, 1, NULL, NULL, NULL, '2', NULL, NULL, NULL, 'Baker', 'Scarlett', 'James', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'scarlett.baker40@example.com', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 74.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-05-26', 1),
(39, NULL, NULL, 0, NULL, NULL, NULL, '41', NULL, NULL, NULL, 'Adams', 'Jack', 'Scott', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'jack.adams39@example.com', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 95.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2020-10-22', 1),
(38, NULL, NULL, 1, NULL, NULL, NULL, '4', NULL, NULL, NULL, 'Green', 'Avery', 'Neil', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'avery.green38@example.com', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 82.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2021-07-30', 1),
(37, NULL, NULL, 0, NULL, NULL, NULL, '5', NULL, NULL, NULL, 'Hill', 'Sebastian', 'Mark', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'sebastian.hill37@example.com', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 87.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2020-05-28', 1),
(36, NULL, NULL, 1, NULL, NULL, NULL, '39', NULL, NULL, NULL, 'Nguyen', 'Aria', 'Belle', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'aria.nguyen36@example.com', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 48.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2023-12-19', 1),
(35, NULL, NULL, 1, NULL, NULL, NULL, '52', NULL, NULL, NULL, 'Torres', 'Samuel', 'Scott', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'samuel.torres35@example.com', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 77.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2024-08-14', 1),
(34, NULL, NULL, 0, NULL, NULL, NULL, '1', NULL, NULL, NULL, 'Scott', 'Zoe', 'Ray', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'zoe.scott34@example.com', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 69.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2022-01-18', 1),
(33, NULL, NULL, 1, NULL, NULL, NULL, '1', NULL, NULL, NULL, 'Wright', 'Joseph', 'Claire', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'joseph.wright33@example.com', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 81.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2021-10-30', 1),
(32, NULL, NULL, 0, NULL, NULL, NULL, '15', NULL, NULL, NULL, 'King', 'Lily', 'Lee', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'lily.king32@example.com', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 67.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2024-11-20', 1),
(31, NULL, NULL, 1, NULL, NULL, NULL, '38', NULL, NULL, NULL, 'Allen', 'Aiden', 'Dawn', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'aiden.allen31@example.com', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 97.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2022-09-09', 1),
(30, NULL, NULL, 0, NULL, NULL, NULL, '24', NULL, NULL, NULL, 'Young', 'Chloe', 'Neil', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'chloe.young30@example.com', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 14.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2024-10-13', 1),
(29, NULL, NULL, 0, NULL, NULL, NULL, '13', NULL, NULL, NULL, 'Walker', 'Elijah', 'Dawn', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'elijah.walker29@example.com', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 24.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2023-08-15', 1),
(28, NULL, NULL, 0, NULL, NULL, NULL, '26', NULL, NULL, NULL, 'Robinson', 'Grace', 'Ruth', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'grace.robinson28@example.com', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 49.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2021-01-06', 1),
(27, NULL, NULL, 1, NULL, NULL, NULL, '49', NULL, NULL, NULL, 'Lewis', 'Logan', 'John', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'logan.lewis27@example.com', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 80.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2020-02-24', 1),
(26, NULL, NULL, 0, NULL, NULL, NULL, '42', NULL, NULL, NULL, 'Ramirez', 'Ella', 'George', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'ella.ramirez26@example.com', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2022-01-12', 1),
(25, NULL, NULL, 1, NULL, NULL, NULL, '5', NULL, NULL, NULL, 'Clark', 'Mason', 'Anne', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'mason.clark25@example.com', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 15.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2020-06-22', 1),
(24, NULL, NULL, 1, NULL, NULL, NULL, '47', NULL, NULL, NULL, 'Sanchez', 'Harper', 'Grace', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'harper.sanchez24@example.com', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 90.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-03-06', 1),
(23, NULL, NULL, 1, NULL, NULL, NULL, '24', NULL, NULL, NULL, 'Harris', 'Lucas', 'Joy', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'lucas.harris23@example.com', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 89.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2020-01-10', 1),
(22, NULL, NULL, 1, NULL, NULL, NULL, '48', NULL, NULL, NULL, 'White', 'Amelia', 'Lynn', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'amelia.white22@example.com', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 88.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2024-08-26', 1),
(21, NULL, NULL, 1, NULL, NULL, NULL, '32', NULL, NULL, NULL, 'Thompson', 'Henry', 'Kate', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'henry.thompson21@example.com', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 38.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2022-10-22', 1),
(20, NULL, NULL, 1, NULL, NULL, NULL, '37', NULL, NULL, NULL, 'Perez', 'Charlotte', 'Ely', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'charlotte.perez20@example.com', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 3.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2024-05-01', 1),
(19, NULL, NULL, 1, NULL, NULL, NULL, '6', NULL, NULL, NULL, 'Lee', 'William', 'Lynn', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'william.lee19@example.com', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 61.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2023-09-26', 1),
(18, NULL, NULL, 0, NULL, NULL, NULL, '9', NULL, NULL, NULL, 'Martin', 'Mia', 'Ruth', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'mia.martin18@example.com', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 60.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2023-08-02', 1),
(17, NULL, NULL, 1, NULL, NULL, NULL, '27', NULL, NULL, NULL, 'Jackson', 'Alexander', 'Lynn', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'alexander.jackson17@example.com', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 46.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-06-10', 1),
(16, NULL, NULL, 1, NULL, NULL, NULL, '7', NULL, NULL, NULL, 'Moore', 'Isabella', 'Marie', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'isabella.moore16@example.com', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2020-02-09', 1),
(15, NULL, NULL, 1, NULL, NULL, NULL, '26', NULL, NULL, NULL, 'Taylor', 'Ethan', 'Mark', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'ethan.taylor15@example.com', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 83.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2023-07-27', 1),
(14, NULL, NULL, 1, NULL, NULL, NULL, '2', NULL, NULL, NULL, 'Thomas', 'Ava', 'Scott', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'ava.thomas14@example.com', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 70.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2021-01-29', 1),
(13, NULL, NULL, 0, NULL, NULL, NULL, '11', NULL, NULL, NULL, 'Anderson', 'Benjamin', 'Mark', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'benjamin.anderson13@example.com', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 18.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2024-09-12', 1);
INSERT INTO `person_table` (`person_id`, `student_number`, `profile_img`, `campus`, `academicProgram`, `classifiedAs`, `applyingAs`, `program`, `program2`, `program3`, `yearLevel`, `last_name`, `first_name`, `middle_name`, `extension`, `nickname`, `height`, `weight`, `lrnNumber`, `nolrnNumber`, `gender`, `pwdMember`, `pwdType`, `pwdId`, `birthOfDate`, `age`, `birthPlace`, `languageDialectSpoken`, `citizenship`, `religion`, `civilStatus`, `tribeEthnicGroup`, `cellphoneNumber`, `emailAddress`, `presentStreet`, `presentBarangay`, `presentZipCode`, `presentRegion`, `presentProvince`, `presentMunicipality`, `presentDswdHouseholdNumber`, `sameAsPresentAddress`, `permanentStreet`, `permanentBarangay`, `permanentZipCode`, `permanentRegion`, `permanentProvince`, `permanentMunicipality`, `permanentDswdHouseholdNumber`, `solo_parent`, `father_deceased`, `father_family_name`, `father_given_name`, `father_middle_name`, `father_ext`, `father_nickname`, `father_education`, `father_education_level`, `father_last_school`, `father_course`, `father_year_graduated`, `father_school_address`, `father_contact`, `father_occupation`, `father_employer`, `father_income`, `father_email`, `mother_deceased`, `mother_family_name`, `mother_given_name`, `mother_middle_name`, `mother_ext`, `mother_nickname`, `mother_education`, `mother_education_level`, `mother_last_school`, `mother_course`, `mother_year_graduated`, `mother_school_address`, `mother_contact`, `mother_occupation`, `mother_employer`, `mother_income`, `mother_email`, `guardian`, `guardian_family_name`, `guardian_given_name`, `guardian_middle_name`, `guardian_ext`, `guardian_nickname`, `guardian_address`, `guardian_contact`, `guardian_email`, `annual_income`, `schoolLevel`, `schoolLastAttended`, `schoolAddress`, `courseProgram`, `honor`, `generalAverage`, `yearGraduated`, `schoolLevel1`, `schoolLastAttended1`, `schoolAddress1`, `courseProgram1`, `honor1`, `generalAverage1`, `yearGraduated1`, `strand`, `cough`, `colds`, `fever`, `asthma`, `faintingSpells`, `heartDisease`, `tuberculosis`, `frequentHeadaches`, `hernia`, `chronicCough`, `headNeckInjury`, `hiv`, `highBloodPressure`, `diabetesMellitus`, `allergies`, `cancer`, `smokingCigarette`, `alcoholDrinking`, `hospitalized`, `hospitalizationDetails`, `medications`, `hadCovid`, `covidDate`, `vaccine1Brand`, `vaccine1Date`, `vaccine2Brand`, `vaccine2Date`, `booster1Brand`, `booster1Date`, `booster2Brand`, `booster2Date`, `chestXray`, `cbc`, `urinalysis`, `otherworkups`, `symptomsToday`, `remarks`, `termsOfAgreement`, `created_at`, `current_step`) VALUES
(12, NULL, NULL, 0, NULL, NULL, NULL, '18', NULL, NULL, NULL, 'Wilson', 'Sophia', 'Jane', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'sophia.wilson12@example.com', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 81.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2023-05-05', 1),
(11, NULL, NULL, 1, NULL, NULL, NULL, '23', NULL, NULL, NULL, 'Gonzalez', 'James', 'John', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'james.gonzalez11@example.com', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 75.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2024-05-13', 1),
(10, NULL, NULL, 1, NULL, NULL, NULL, '22', NULL, NULL, NULL, 'Lopez', 'Olivia', 'Marie', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'olivia.lopez10@example.com', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 49.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2024-12-25', 1),
(7, NULL, NULL, 0, NULL, NULL, NULL, '44', NULL, NULL, NULL, 'Miller', 'Daniel', 'Jane', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'daniel.miller7@example.com', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 65.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2020-08-24', 1),
(8, NULL, NULL, 1, NULL, NULL, NULL, '15', NULL, NULL, NULL, 'Davis', 'Ashley', 'Ely', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'ashley.davis8@example.com', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 14.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2021-05-19', 1),
(9, NULL, NULL, 0, NULL, NULL, NULL, '36', NULL, NULL, NULL, 'Martinez', 'Matthew', 'Dawn', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'matthew.martinez9@example.com', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 84.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2021-03-14', 1),
(3, NULL, NULL, 1, NULL, NULL, NULL, '19', NULL, NULL, NULL, 'Williams', 'Michael', 'Lee', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'michael.williams3@example.com', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 91.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2021-04-18', 1),
(4, NULL, NULL, 1, '', NULL, NULL, '36', NULL, NULL, NULL, 'Brown', 'Sarah', 'Kate', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'sarah.brown4@example.com', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 10.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2024-01-13', 1),
(5, NULL, NULL, 1, NULL, NULL, NULL, '51', NULL, NULL, NULL, 'Jones', 'David', 'James', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'david.jones5@example.com', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 39.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-04-27', 1),
(6, NULL, NULL, 1, NULL, NULL, NULL, '38', NULL, NULL, NULL, 'Garcia', 'Jessica', 'Belle', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'jessica.garcia6@example.com', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 10.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2022-09-29', 1),
(306, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'De La Cruz', 'Lloyd Cedrick', 'Pacheco', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'delacruz.lc.bsinfotech@gmail.com', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-08-09', 1),
(307, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Montano', 'Mark Anthony', 'Placido', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'montano.ma.bsinfotech@gmail.com', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-09-16', 1),
(308, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Ciruela', 'Genny', 'D.', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'montano.ma.bsinfotech@gmail.com', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-09-16', 1),
(1347, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Montano', 'Mark Anthony', 'Placido', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'montano.ma.bsinfotech@gmail.com', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-10-01', 1);

-- --------------------------------------------------------

--
-- Table structure for table `prof_table`
--

CREATE TABLE `prof_table` (
  `prof_id` int(11) NOT NULL,
  `person_id` int(11) DEFAULT NULL,
  `profile_image` varchar(255) NOT NULL,
  `fname` varchar(100) DEFAULT NULL,
  `mname` varchar(100) DEFAULT NULL,
  `lname` varchar(100) DEFAULT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) DEFAULT NULL,
  `status` tinyint(1) DEFAULT 0 CHECK (`status` in (0,1)),
  `role` enum('applicant','faculty','registrar') NOT NULL DEFAULT 'faculty'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `prof_table`
--

INSERT INTO `prof_table` (`prof_id`, `person_id`, `profile_image`, `fname`, `mname`, `lname`, `email`, `password`, `status`, `role`) VALUES
(1, 1, '', 'Hazel', 'Fogata', 'Anuncio', 'hazel.anuncio@earist.edu.ph', 'ANUNCIO', 1, 'faculty'),
(2, 2, '', 'Eleazar', 'B.', 'Bernales', 'eleazar.bernales@earist.edu.ph', 'BERNALES', 0, 'faculty'),
(3, 3, '', 'Lester', 'Dela Cruz', 'Bernardino', 'lester.bernardino@earist.edu.ph', 'BERNARDINO', 0, 'faculty'),
(4, 4, '', 'Carlito', '', 'Biares', 'carlito.biares@earist.edu.ph', 'BIARES', 0, 'faculty'),
(5, 5, '', 'James Darryl', 'Dela Cruz', 'Bungay', 'james.bungay@earist.edu.ph', 'BUNGAY', 0, 'faculty'),
(6, 6, '', 'Renz Angelo', 'De Vera', 'Cadaoas', 'renz.cadaoas@earist.edu.ph', 'CADAOAS', 0, 'faculty'),
(7, 7, '', 'Nerissa', 'Bugarin', 'Capili', 'nerissa.capili@earist.edu.ph', 'CAPILI', 0, 'faculty'),
(8, 8, '', 'Romeo', 'B.', 'Capucao', 'romeo.capucao@earist.edu.ph', 'CAPUCAO', 0, 'faculty'),
(9, 9, '', 'Ernanie', 'Molina', 'Carlos', 'ernanie.carlos@earist.edu.ph', 'CARLOS', 0, 'faculty'),
(10, 10, '', 'Harold', 'Aspa', 'Casimira', 'harold.casimira@earist.edu.ph', 'CASIMIRA', 0, 'faculty'),
(11, 11, '', 'Rosel', 'Ortiz', 'Cipriano', 'rosel.cipriano@earist.edu.ph', 'CIPRIANO', 0, 'faculty'),
(12, 12, '', 'Janchloe', 'M', 'Duyan', 'janchloe.duyan@earist.edu.ph', 'DUYAN', 0, 'faculty'),
(13, 13, '', 'Arlene', 'Peña', 'Evangelista', 'arlene.evangelista@earist.edu.ph', 'EVANGELISTA', 0, 'faculty'),
(14, 14, '', 'Joevelyn', 'Waje', 'Fajardo', 'joevelyn.fajardo@earist.edu.ph', 'FAJARDO', 0, 'faculty'),
(15, 15, '', 'Dennis', 'Berboso', 'Gonzales', 'dennis.gonzales@earist.edu.ph', 'GONZALES', 0, 'faculty'),
(16, 16, '', 'Merlita', 'Cruz', 'Latip', 'merlita.latip@earist.edu.ph', 'LATIP', 0, 'faculty'),
(17, 17, '', 'Reeneir', 'Ramos', 'Ledesma', 'reeneir.ledesma@earist.edu.ph', 'LEDESMA', 0, 'faculty'),
(18, 18, '', 'Dennis', 'Dela Peña', 'Mangubat', 'dennis.mangubat@earist.edu.ph', 'MANGUBAT', 0, 'faculty'),
(19, 19, '', 'Sheila Marie', 'Mobo', 'Matias', 'sheila.matias@earist.edu.ph', 'MATIAS', 0, 'faculty'),
(20, 20, '', 'Joseph', 'Tarrayo', 'Moraca', 'joseph.moraca@earist.edu.ph', 'MORACA', 0, 'faculty'),
(21, 21, '', 'Ruth Lareza', 'Aguilar', 'Morales', 'ruth.morales@earist.edu.ph', 'MORALES', 0, 'faculty'),
(22, 22, '', 'Mark Kenneth', 'Barnobal', 'Nicart', 'mark.nicart@earist.edu.ph', 'NICART', 0, 'faculty'),
(23, 23, '', 'Rodora', 'Tanglao', 'Oliveros', 'rodora.oliveros@earist.edu.ph', 'OLIVEROS', 0, 'faculty'),
(24, 24, '', 'Abigail', 'J.', 'Purificacion', 'abigail.purificacion@earist.edu.ph', 'PURIFICACION', 0, 'faculty'),
(25, 25, '', 'Raynald', 'C', 'Redondo', 'raynald.redondo@earist.edu.ph', 'REDONDO', 0, 'faculty'),
(26, 26, '', 'Hiromi', '', 'Rivas', 'hiromi.rivas@earist.edu.ph', 'RIVAS', 0, 'faculty'),
(27, 27, '', 'Eula Luz Jasmine Dioneo', '', 'Sandoval', 'eula.sandoval@earist.edu.ph', 'SANDOVAL', 0, 'faculty'),
(28, 28, '', 'Al', 'Ferrer', 'Santiago', 'al.santiago@earist.edu.ph', 'SANTIAGO', 0, 'faculty'),
(29, 29, '', 'Larex', 'Bartolome', 'Tagalog', 'larex.tagalog@earist.edu.ph', 'TAGALOG', 0, 'faculty'),
(30, 30, '', 'Jayson', 'D.', 'Tolentino', 'jayson.tolentino@earist.edu.ph', 'TOLENTINO', 0, 'faculty'),
(31, 31, '', 'Edmund Sinagub', NULL, 'Almazan', 'edmund.almazan@earist.edu.ph', 'ALMAZAN', 0, 'faculty'),
(32, 32, '', 'Jesus', 'de los Santos', 'Paguigan', 'jesus.paguigan@earist.edu.ph', 'PAGUIGAN', 0, 'faculty'),
(33, 33, '', 'Kathleen', NULL, 'Dimaano', 'kathleen.dimaano@earist.edu.ph', 'DIMAANO', 0, 'faculty'),
(34, 34, '', 'Charlene', NULL, 'Ronda', 'charlene.ronda@earist.edu.ph', 'RONDA', 0, 'faculty'),
(35, 35, '', 'Maria Jasmine', NULL, 'Macasil', 'jasmine.macasil@earist.edu.ph', 'MACASIL', 0, 'faculty'),
(36, 36, '', 'Jefferson', NULL, 'Costales', 'jefferson.costales@earist.edu.ph', 'COSTALES', 0, 'faculty'),
(37, 37, '', 'Arjo', NULL, 'Ladia', 'arjo.ladia@earist.edu.ph', 'LADIA', 0, 'faculty'),
(38, 38, '06262003_ProfessorProfile_2025.jpg', 'Mark Anthony', 'Placido', 'Montano', 'markmontano999@gmail.com', '$2b$10$eUcFSQXtFxPNdj7vR/UVCu0Of0Y/CszW7zxQnmKj2x0.akxOQJIZi', 1, 'faculty'),
(63, 98, '98_ProfessorProfile_2025.png', 'Dhani', 'San', 'Jose', 'disanjose@earist.edu.ph', '$2b$10$/XhdvzV/4rugRbZH5gWafenpXBkbuJT2pjsopS85Mj27vDI2ZjFxm', 1, 'faculty');

-- --------------------------------------------------------

--
-- Table structure for table `program_table`
--

CREATE TABLE `program_table` (
  `program_id` int(11) NOT NULL,
  `program_description` varchar(255) DEFAULT NULL,
  `program_code` varchar(100) DEFAULT NULL,
  `major` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `program_table`
--

INSERT INTO `program_table` (`program_id`, `program_description`, `program_code`, `major`) VALUES
(1, 'Bachelor of Science in Architecture', 'BS ARCHIS', NULL),
(2, 'Bachelor of Science in Interior Design', 'BSID', NULL),
(3, 'Bachelor in Fine Arts Major in Painting', 'BFA-PAINT', 'Painting'),
(4, 'Bachelor in Fine Arts Major in Visual Communication', 'BFA-VISCOM', 'Visual Communication'),
(5, 'Bachelor of Science in Applied Physics with Computer Science Emphasis', 'BSAP', NULL),
(6, 'Bachelor of Science in Psychology', 'BSPSYCH', NULL),
(7, 'Bachelor of Science in Mathematics', 'BSMATH', NULL),
(8, 'Bachelor of Science in Business Administration Major in Marketing Management', 'BSBA-MM', 'Marketing Management'),
(9, 'Bachelor of Science in Business Administration Major in HR Development Management', 'BSBA-HRDM', 'Human Resource Development Management '),
(10, 'Bachelor of Science in Entrepreneurship', 'BSEM', NULL),
(11, 'Bachelor of Science in Office Administration', 'BSOA', NULL),
(12, 'Bachelor of Science in Criminology', 'BSCRIM', NULL),
(13, 'Bachelor in Public Administration', 'BPA', NULL),
(14, 'Bachelor of Science in Computer Science', 'BSCS', NULL),
(15, 'Bachelor of Science in Information Technology', 'BSINFOTECH', NULL),
(16, 'Bachelor in Secondary Education Major in Science', 'BSE-SCI', 'Science'),
(17, 'Bachelor in Secondary Education Major in Mathematics', 'BSE-MATH', 'Mathematics'),
(18, 'Bachelor in Secondary Education Major in Filipino', 'BSE-FIL', 'Filipino'),
(19, 'Bachelor in Special Needs Education', 'BSNEd', NULL),
(20, 'Bachelor in Technology and Livelihood Education Major in Home Economics', 'BTLE-HE', 'Home Economics'),
(21, 'Bachelor in Technology and Livelihood Education Major in Industrial Arts', 'BTLE-IA', 'Industrial Arts'),
(22, 'Professional Education Subjects (TCP)', 'TCP', NULL),
(24, 'Bachelor of Science in Chemical Engineering', 'BSCHE', NULL),
(25, 'Bachelor of Science in Civil Engineering', 'BSCE', NULL),
(26, 'Bachelor of Science in Electrical Engineering', 'BSEE', NULL),
(27, 'Bachelor of Science in Electronics and Communication Engineering', 'BSECE', NULL),
(28, 'Bachelor of Science in Mechanical Engineering', 'BSME', NULL),
(29, 'Bachelor of Science in Computer Engineering', 'BSCOE', NULL),
(30, 'Bachelor of Science in Tourism Management', 'BST', NULL),
(31, 'Bachelor of Science in Hospitality Management', 'BSHM', NULL),
(32, 'Bachelor of Science in Industrial Technology Major in Automotive Technology', 'BSIT-AUTO', 'Automotive Technology'),
(33, 'Bachelor of Science in Industrial Technology Major in Electrical Technology', 'BSIT-ELEC', 'Electrical Technology'),
(34, 'Bachelor of Science in Industrial Technology Major in Electronics Technology', 'BSIT-ET', 'Electronics Technology'),
(35, 'Bachelor of Science in Industrial Technology Major in Food Technology', 'BSIT-FOOD', 'Food Technology\n'),
(36, 'Bachelor of Science in Industrial Technology Major in Fashion and Apparel Technology', 'BSIT-FASHION', 'Fashion and Apparel Technology'),
(37, 'Bachelor of Science in Industrial Technology Major in Industrial Chemistry', 'BSIT-CHEM', 'Industrial Chemistry'),
(38, 'Bachelor of Science in Industrial Technology Major in Drafting Technology', 'BSIT-DRAFT', 'Drafting Technology'),
(39, 'Bachelor of Science in Industrial Technology Major in Machine Shop Technology', 'BSIT-MECH', 'Machine Shop Technology\n'),
(40, 'Bachelor of Science in Industrial Technology Major in Refrigeration and Air Conditioning', 'BSIT-RAC', 'Refrigeration and Air Conditioning'),
(41, 'Doctor of Philosophy Industrial Psychology', 'DPIP', 'Industrial Psychology'),
(42, 'Doctor of Education Educational Management', 'DEEM', 'Educational Management'),
(43, 'Doctor in Business Administration', 'DBA', NULL),
(44, 'Doctor in Public Administration', 'DPA', NULL),
(45, 'Master of Science in Mathematics', 'MSA', NULL),
(46, 'Master of Arts in Industrial Psychology', 'MAIP', NULL),
(47, 'Master in Business Administration', 'MBA', NULL),
(48, 'Master in Public Administration', 'MPA', NULL),
(49, 'Master of Arts in Industrial Education Hotel Management', 'MAIEHM', 'Hotel Management'),
(50, 'Master of Arts in Education Administration and Supervision', 'MAEAS', 'Administration and Supervision'),
(51, 'Master of Arts in Education Guidance and Counseling', 'MAEGC', 'Guidance and Counseling'),
(52, 'Master of Arts in Education Special Education', 'MAESE', 'Special Education'),
(53, 'Master of Arts in Teaching Electronics Technology', 'MATET', 'Electronics Technology'),
(54, 'Master of Arts in Teaching Mathematics', 'MATM', 'Mathematics'),
(55, 'Master of Arts in Teaching Science', 'MATS', 'Science'),
(58, 'Bachelor of Science Information Technology', 'BSIT', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `program_tagging_table`
--

CREATE TABLE `program_tagging_table` (
  `program_tagging_id` int(11) NOT NULL,
  `curriculum_id` int(11) DEFAULT NULL,
  `year_level_id` int(11) DEFAULT NULL,
  `semester_id` int(11) DEFAULT NULL,
  `course_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `program_tagging_table`
--

INSERT INTO `program_tagging_table` (`program_tagging_id`, `curriculum_id`, `year_level_id`, `semester_id`, `course_id`) VALUES
(1, 1, 3, 1, 1),
(2, 1, 1, 1, 2),
(3, 1, 1, 1, 3),
(4, 1, 1, 1, 4),
(5, 1, 1, 1, 5),
(6, 1, 1, 1, 6),
(7, 1, 1, 1, 7),
(8, 1, 1, 1, 8),
(9, 1, 1, 1, 9),
(10, 1, 1, 1, 10),
(11, 1, 1, 1, 11),
(12, 1, 1, 2, 12),
(13, 1, 1, 2, 13),
(14, 1, 1, 2, 14),
(15, 1, 1, 2, 15),
(16, 1, 1, 2, 16),
(17, 1, 1, 2, 17),
(18, 1, 1, 2, 18),
(19, 1, 1, 2, 19),
(20, 1, 1, 2, 20),
(21, 1, 1, 2, 21),
(22, 1, 1, 2, 22),
(23, 1, 2, 1, 23),
(24, 1, 2, 1, 24),
(25, 1, 2, 1, 25),
(26, 1, 2, 1, 26),
(27, 1, 2, 1, 27),
(28, 1, 2, 1, 28),
(29, 1, 2, 1, 29),
(30, 1, 2, 1, 30),
(31, 1, 2, 1, 31),
(32, 1, 2, 1, 32),
(33, 1, 2, 1, 33),
(34, 1, 2, 2, 34),
(35, 1, 2, 2, 35),
(36, 1, 2, 2, 36),
(37, 1, 2, 2, 37),
(38, 1, 2, 2, 38),
(39, 1, 2, 2, 39),
(40, 1, 2, 2, 40),
(41, 1, 2, 2, 41),
(42, 1, 2, 2, 42),
(43, 1, 2, 2, 43),
(44, 1, 2, 2, 44),
(45, 1, 2, 2, 45),
(46, 1, 3, 1, 46),
(47, 1, 3, 1, 47),
(48, 1, 3, 1, 48),
(49, 1, 3, 1, 49),
(50, 1, 3, 1, 50),
(51, 1, 3, 1, 51),
(52, 1, 3, 1, 52),
(53, 1, 3, 1, 53),
(54, 1, 3, 1, 54),
(55, 1, 3, 1, 55),
(56, 1, 3, 1, 56),
(57, 1, 3, 2, 57),
(58, 1, 3, 2, 58),
(59, 1, 3, 2, 59),
(60, 1, 3, 2, 60),
(61, 1, 3, 2, 61),
(62, 1, 3, 2, 62),
(63, 1, 3, 2, 63),
(64, 1, 3, 2, 64),
(65, 1, 3, 2, 65),
(66, 1, 3, 2, 66),
(67, 1, 4, 1, 67),
(68, 1, 4, 1, 68),
(69, 1, 4, 1, 69),
(70, 1, 4, 1, 70),
(71, 1, 4, 1, 71),
(72, 1, 4, 1, 72),
(73, 1, 4, 1, 73),
(74, 1, 4, 1, 74),
(75, 1, 4, 1, 75),
(76, 1, 4, 1, 76),
(77, 1, 4, 2, 77),
(78, 2, 3, 2, 71),
(79, 4, 1, 2, 2);

-- --------------------------------------------------------

--
-- Table structure for table `question_table`
--

CREATE TABLE `question_table` (
  `id` int(11) NOT NULL,
  `question_description` varchar(255) NOT NULL,
  `first_choice` varchar(255) NOT NULL,
  `second_choice` varchar(255) NOT NULL,
  `third_choice` varchar(255) NOT NULL,
  `fourth_choice` varchar(255) NOT NULL,
  `fifth_choice` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `question_table`
--

INSERT INTO `question_table` (`id`, `question_description`, `first_choice`, `second_choice`, `third_choice`, `fourth_choice`, `fifth_choice`) VALUES
(7, 'Is prof good?', '1', '2', '3', '4', '5'),
(8, 'Is prof alright?', '1', '2', '3', '4', '5'),
(9, 'Is prof nice?', '1', '2', '3', '4', '5');

-- --------------------------------------------------------

--
-- Table structure for table `requirements_table`
--

CREATE TABLE `requirements_table` (
  `id` int(11) NOT NULL,
  `description` varchar(255) NOT NULL,
  `short_label` varchar(255) DEFAULT NULL,
  `label` varchar(255) DEFAULT NULL,
  `category` varchar(50) DEFAULT 'Regular',
  `is_verifiable` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `requirements_table`
--

INSERT INTO `requirements_table` (`id`, `description`, `short_label`, `label`, `category`, `is_verifiable`) VALUES
(1, 'PSA Birth Certificate', 'PSA', NULL, 'Regular', 1),
(2, 'Form 138 (4th Quarter / No failing Grades)', 'F138', NULL, 'Regular', 1),
(3, 'Certificate of Good Moral Character', 'CGMC', NULL, 'Regular', 1),
(4, 'Certificate belonging to Graduating Class', 'CBGC', NULL, 'Regular', 1),
(5, 'Copy of Vaccine Card (1st and 2nd Dose)', 'CVC', NULL, 'Medical', 1),
(32, 'THESIS PURPOSES', 'TP', NULL, 'Regular', 1),
(35, 'INFORMATION TECHNOLOGY', 'TH', NULL, 'Others', 1);

-- --------------------------------------------------------

--
-- Table structure for table `requirement_uploads`
--

CREATE TABLE `requirement_uploads` (
  `upload_id` int(11) NOT NULL,
  `requirements_id` int(11) NOT NULL,
  `person_id` int(11) NOT NULL,
  `submitted_documents` int(11) DEFAULT NULL,
  `file_path` varchar(255) NOT NULL,
  `original_name` varchar(100) DEFAULT NULL,
  `remarks` varchar(255) DEFAULT NULL,
  `status` int(11) DEFAULT NULL,
  `document_status` varchar(255) DEFAULT NULL,
  `missing_documents` varchar(255) DEFAULT NULL,
  `registrar_status` int(11) DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `last_updated_by` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Dumping data for table `requirement_uploads`
--

INSERT INTO `requirement_uploads` (`upload_id`, `requirements_id`, `person_id`, `submitted_documents`, `file_path`, `original_name`, `remarks`, `status`, `document_status`, `missing_documents`, `registrar_status`, `created_at`, `last_updated_by`) VALUES
(178, 1, 323, NULL, '2025100214_BirthCertificate_2025.pdf', 'personaldataformprint.pdf', '75% OF ATTENDANCE IS NEEDED FOR TRANSFEREE', 1, 'Documents Verified & ECAT', NULL, NULL, '2025-10-01 16:05:17', NULL),
(179, 2, 323, NULL, '2025100214_Form138_2025.pdf', 'examinationpermit.pdf', 'GWA did not meet the Requirements', 1, 'Documents Verified & ECAT', NULL, NULL, '2025-10-01 16:05:20', NULL),
(180, 3, 323, NULL, '2025100214_GoodMoralCharacter_2025.pdf', 'officeoftheregistrar.pdf', 'FORM 138 IS NOT COMPLETE', 1, 'Documents Verified & ECAT', NULL, NULL, '2025-10-01 16:05:23', NULL),
(181, 4, 323, NULL, '2025100214_CertificateOfGraduatingClass_2025.pdf', 'IAAS2_Midterm Activity No 2.pdf', 'Have failed and incomplete grades', 1, 'Documents Verified & ECAT', NULL, NULL, '2025-10-01 16:05:28', NULL),
(182, 5, 323, NULL, '2025100214_VaccineCard_2025.pdf', 'examinationpermit.pdf', NULL, 1, 'Disapproved', NULL, NULL, '2025-10-01 16:05:32', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `room_day_table`
--

CREATE TABLE `room_day_table` (
  `id` int(11) NOT NULL,
  `description` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `room_day_table`
--

INSERT INTO `room_day_table` (`id`, `description`) VALUES
(1, 'SUN'),
(2, 'MON'),
(3, 'TUE'),
(4, 'WED'),
(5, 'THU'),
(6, 'FRI'),
(7, 'SAT');

-- --------------------------------------------------------

--
-- Table structure for table `room_table`
--

CREATE TABLE `room_table` (
  `room_id` int(11) NOT NULL,
  `room_description` varchar(255) DEFAULT NULL,
  `building_description` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `room_table`
--

INSERT INTO `room_table` (`room_id`, `room_description`, `building_description`) VALUES
(1, 'CCS Room 201', NULL),
(2, 'CCS Room 202', NULL),
(3, 'CCS Room 301', NULL),
(4, 'CCS Room 302', NULL),
(5, 'CCS Room 303', NULL),
(11, 'CSS Room 203', NULL),
(12, 'CAS Room 204', NULL),
(13, 'CAS Room 401', NULL),
(14, 'CAS Room 402', NULL),
(15, 'CAS Room 403', NULL),
(16, 'CAS Room 404', NULL),
(17, 'CAS Room 405', NULL),
(18, 'CAS Room 406', NULL),
(19, 'CAS Room 409', NULL),
(20, 'CAS Room 411', NULL),
(21, 'CAFA', 'NUDAS HALL'),
(22, 'MIS', NULL),
(23, 'MIS101', NULL),
(24, '123 Mabini St.', 'Pureza'),
(25, 'CCS Room 202', 'NUDAS HALL'),
(26, 'Cas Room 203', 'NUDAS HALL Building'),
(27, 'CSS 202', 'MIS Building'),
(28, 'CCS 203', 'MIS Building');

-- --------------------------------------------------------

--
-- Table structure for table `school_time_table`
--

CREATE TABLE `school_time_table` (
  `id` int(11) NOT NULL,
  `description` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `school_time_table`
--

INSERT INTO `school_time_table` (`id`, `description`) VALUES
(1, '07:00 AM'),
(2, '07:30 AM'),
(3, '08:00 AM'),
(4, '08:30 AM'),
(5, '09:00 AM'),
(6, '09:30 AM'),
(7, '10:00 AM'),
(8, '10:30 AM'),
(9, '11:00 AM'),
(10, '11:30 AM'),
(11, '12:00 PM'),
(12, '12:30 PM'),
(13, '01:00 PM'),
(14, '01:30 PM'),
(15, '02:00 PM'),
(16, '02:30 PM'),
(17, '03:00 PM'),
(18, '03:30 PM'),
(19, '04:00 PM'),
(20, '04:30 PM'),
(21, '05:00 PM'),
(22, '05:30 PM'),
(23, '06:00 PM'),
(24, '06:30 PM'),
(25, '07:00 PM'),
(26, '07:30 PM'),
(27, '08:00 PM'),
(28, '08:30 PM'),
(29, '09:00 PM');

-- --------------------------------------------------------

--
-- Table structure for table `section_table`
--

CREATE TABLE `section_table` (
  `id` int(11) NOT NULL,
  `description` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `section_table`
--

INSERT INTO `section_table` (`id`, `description`) VALUES
(1, '1A'),
(2, '1B'),
(3, '1C'),
(4, '2A'),
(5, '2B'),
(6, '2C'),
(7, '3A'),
(8, '3B'),
(9, '3C'),
(10, '4A'),
(11, '4B'),
(12, '4C');

-- --------------------------------------------------------

--
-- Table structure for table `semester_table`
--

CREATE TABLE `semester_table` (
  `semester_id` int(11) NOT NULL,
  `semester_description` varchar(255) DEFAULT NULL,
  `semester_code` varchar(2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `semester_table`
--

INSERT INTO `semester_table` (`semester_id`, `semester_description`, `semester_code`) VALUES
(1, 'First Semester', '1'),
(2, 'Second Semester', '2'),
(3, 'Summer', '3');

-- --------------------------------------------------------

--
-- Table structure for table `student_counter`
--

CREATE TABLE `student_counter` (
  `id` int(11) NOT NULL,
  `que_number` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `student_counter`
--

INSERT INTO `student_counter` (`id`, `que_number`) VALUES
(1, 0),
(2, 0);

-- --------------------------------------------------------

--
-- Table structure for table `student_curriculum_table`
--

CREATE TABLE `student_curriculum_table` (
  `id` int(11) NOT NULL,
  `student_numbering_id` int(11) DEFAULT NULL,
  `curriculum_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `student_evaluation_table`
--

CREATE TABLE `student_evaluation_table` (
  `id` int(11) NOT NULL,
  `student_number` varchar(255) NOT NULL,
  `school_year_id` int(11) NOT NULL DEFAULT 0,
  `prof_id` int(11) DEFAULT NULL,
  `course_id` int(11) NOT NULL DEFAULT 0,
  `question_id` int(11) NOT NULL DEFAULT 0,
  `question_answer` int(11) NOT NULL DEFAULT 0,
  `answered_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `student_grade_overall_table`
--

CREATE TABLE `student_grade_overall_table` (
  `id` int(11) NOT NULL,
  `student_number` int(11) NOT NULL,
  `course_id` int(11) NOT NULL,
  `final_grade` decimal(2,2) NOT NULL,
  `active_school_year_id` int(11) NOT NULL,
  `remarks` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `student_grade_overall_table`
--

INSERT INTO `student_grade_overall_table` (`id`, `student_number`, `course_id`, `final_grade`, `active_school_year_id`, `remarks`) VALUES
(1, 224095240, 1, 0.99, 2, 1),
(2, 224091140, 2, 0.99, 2, 1);

-- --------------------------------------------------------

--
-- Table structure for table `student_numbering_table`
--

CREATE TABLE `student_numbering_table` (
  `id` int(11) NOT NULL,
  `student_number` varchar(255) NOT NULL,
  `person_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `student_numbering_table`
--

INSERT INTO `student_numbering_table` (`id`, `student_number`, `person_id`) VALUES
(1, '202500001', 1),
(2, '202500002', 2),
(3, '202500003', 3),
(4, '202500004', 4),
(5, '202500005', 5),
(6, '202500006', 6),
(7, '202500007', 7),
(8, '202500008', 8),
(9, '202500009', 9),
(10, '202500010', 10),
(11, '202500011', 11),
(12, '202500012', 12),
(13, '202500013', 13),
(14, '202500014', 14),
(15, '202500015', 15),
(16, '202500016', 16),
(17, '202500017', 17),
(18, '202500018', 18),
(19, '202500019', 19),
(20, '202500020', 20),
(21, '202500021', 21),
(22, '202500022', 22),
(23, '202500023', 23),
(24, '202500024', 24),
(25, '202500025', 25),
(26, '202500026', 26),
(27, '202500027', 27),
(28, '202500028', 28),
(29, '202500029', 29),
(30, '202500030', 30),
(31, '202500031', 31),
(32, '202500032', 32),
(33, '202500033', 33),
(34, '202500034', 34),
(35, '202500035', 35),
(36, '202500036', 36),
(37, '202500037', 37),
(38, '202500038', 38),
(39, '202500039', 39),
(40, '202500040', 40),
(41, '202500041', 41),
(42, '202500042', 42),
(43, '202500043', 43),
(44, '202500044', 44),
(45, '202500045', 45),
(46, '202500046', 46),
(47, '202500047', 47),
(48, '202500048', 48),
(49, '202500049', 49),
(50, '202500050', 50),
(51, '202500051', 51),
(52, '202500052', 52),
(53, '202500053', 53),
(54, '202500054', 54),
(55, '202500055', 55),
(56, '202500056', 56),
(57, '202500057', 57),
(58, '202500058', 58),
(59, '202500059', 59),
(60, '202500060', 60),
(61, '202500306', 306),
(62, '202500307', 307),
(63, '202500309', 309),
(80, '224-09114M', 1337),
(81, '234-14491M', 1338),
(82, '234-14491M', 1339),
(83, '234-14491M', 1340),
(84, '234-14491M', 1341),
(85, '202500001', 1342),
(86, '202500002', 1343),
(87, '202500003', 1344),
(88, '202500004', 1345),
(89, '202500005', 1346),
(90, '202500323', 323),
(91, '202500001', 1348),
(92, '202500002', 1349),
(93, '202500003', 1350),
(94, '202500004', 1351),
(95, '202500005', 1352),
(96, '202500001', 1353),
(97, '202500002', 1354),
(98, '202500003', 1355),
(99, '202500004', 1356),
(100, '202500005', 1357),
(101, '210-05278M', 1359),
(102, '210-04890M', 1360),
(103, '210-04171M', 1361),
(104, '210-04153M', 1362),
(105, '210-04151M', 1363),
(106, '210-04147M', 1364),
(107, '210-03312M', 1365),
(108, '210-01616M', 1366),
(109, '210-01605M', 1367),
(110, '210-01603M', 1368),
(111, '210-01601M', 1369),
(112, '206-0554', 1370),
(113, '200-0204', 1371),
(114, '200-0196', 1372),
(115, '200-0184', 1373),
(116, '200-0163', 1374),
(117, '200-0158', 1375),
(118, '200-0157', 1376),
(119, '200-0154', 1377),
(120, '200-0153', 1378),
(121, '200-0152', 1379),
(122, '200-0145', 1380);

-- --------------------------------------------------------

--
-- Table structure for table `student_status_table`
--

CREATE TABLE `student_status_table` (
  `id` int(11) NOT NULL,
  `student_number` varchar(255) DEFAULT NULL,
  `active_curriculum` int(11) DEFAULT NULL,
  `enrolled_status` varchar(11) DEFAULT NULL,
  `year_level_id` int(11) DEFAULT NULL,
  `active_school_year_id` int(11) DEFAULT NULL,
  `control_status` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `student_status_table`
--

INSERT INTO `student_status_table` (`id`, `student_number`, `active_curriculum`, `enrolled_status`, `year_level_id`, `active_school_year_id`, `control_status`) VALUES
(36, '202500001', 1, '1', 1, 0, 0),
(37, '202500002', 1, '1', 1, 0, 0),
(38, '202500012', 0, '1', 0, 0, 0),
(39, '202500009', 0, '1', 0, 0, 0),
(40, '202500003', 0, '1', 0, 0, 0),
(41, '202500004', 0, '1', 0, 0, 0),
(42, '202500005', 0, '1', 0, 0, 0),
(43, '202500006', 0, '1', 0, 0, 0),
(44, '202500007', 0, '1', 0, 0, 0),
(45, '202500008', 0, '1', 0, 0, 0),
(46, '202500010', 0, '1', 0, 0, 0),
(47, '202500011', 0, '1', 0, 0, 0),
(48, '202500013', 0, '1', 0, 0, 0),
(49, '202500014', 0, '1', 0, 0, 0),
(50, '202500015', 0, '1', 0, 0, 0),
(51, '202500017', 0, '1', 0, 0, 0),
(52, '202500016', 0, '1', 0, 0, 0),
(53, '202500019', 0, '1', 0, 0, 0),
(54, '202500018', 0, '1', 0, 0, 0),
(55, '202500020', 0, '1', 0, 0, 0),
(56, '202500021', 0, '1', 0, 0, 0),
(57, '202500022', 0, '1', 0, 0, 0),
(58, '202500023', 0, '1', 0, 0, 0),
(59, '202500025', 0, '1', 0, 0, 0),
(60, '202500024', 0, '1', 0, 0, 0),
(61, '202500028', 0, '1', 0, 0, 0),
(62, '202500029', 0, '1', 0, 0, 0),
(63, '202500030', 0, '1', 0, 0, 0),
(64, '202500027', 0, '1', 0, 0, 0),
(65, '202500026', 0, '1', 0, 0, 0),
(66, '202500032', 0, '1', 0, 0, 0),
(67, '202500031', 0, '1', 0, 0, 0),
(68, '202500034', 0, '1', 0, 0, 0),
(69, '202500033', 0, '1', 0, 0, 0),
(70, '202500036', 0, '1', 0, 0, 0),
(71, '202500037', 0, '1', 0, 0, 0),
(72, '202500035', 0, '1', 0, 0, 0),
(73, '202500038', 0, '1', 0, 0, 0),
(74, '202500040', 0, '1', 0, 0, 0),
(75, '202500039', 0, '1', 0, 0, 0),
(76, '202500041', 0, '1', 0, 0, 0),
(77, '202500042', 0, '1', 0, 0, 0),
(78, '202500043', 0, '1', 0, 0, 0),
(79, '202500044', 0, '1', 0, 0, 0),
(80, '202500045', 0, '1', 0, 0, 0),
(81, '202500047', 0, '1', 0, 0, 0),
(82, '202500048', 0, '1', 0, 0, 0),
(83, '202500046', 0, '1', 0, 0, 0),
(84, '202500049', 0, '1', 0, 0, 0),
(85, '202500051', 0, '1', 0, 0, 0),
(86, '202500050', 0, '1', 0, 0, 0),
(87, '202500052', 0, '1', 0, 0, 0),
(88, '202500054', 0, '1', 0, 0, 0),
(89, '202500053', 0, '1', 0, 0, 0),
(90, '202500055', 0, '1', 0, 0, 0),
(91, '202500056', 0, '1', 0, 0, 0),
(92, '202500058', 0, '1', 0, 0, 0),
(93, '202500057', 0, '1', 0, 0, 0),
(94, '202500059', 0, '1', 0, 0, 0),
(95, '202500060', 1, '1', 1, 0, 0),
(96, '202500306', 1, '1', 1, 0, 0),
(97, '202500307', 0, '1', 0, 0, 0),
(98, '202500309', 0, '1', 0, 0, 0),
(99, '202500323', 0, '1', 0, 0, 0);

-- --------------------------------------------------------

--
-- Table structure for table `time_table`
--

CREATE TABLE `time_table` (
  `id` int(11) NOT NULL,
  `room_day` int(11) DEFAULT NULL,
  `school_time_start` varchar(11) DEFAULT NULL,
  `school_time_end` varchar(11) DEFAULT NULL,
  `department_section_id` int(11) DEFAULT NULL,
  `course_id` int(11) DEFAULT NULL,
  `professor_id` int(11) DEFAULT NULL,
  `department_room_id` int(11) DEFAULT NULL,
  `school_year_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `time_table`
--

INSERT INTO `time_table` (`id`, `room_day`, `school_time_start`, `school_time_end`, `department_section_id`, `course_id`, `professor_id`, `department_room_id`, `school_year_id`) VALUES
(24, 2, '10:00 AM', '12:00 PM', 1, 13, 38, 21, 12),
(25, 2, '12:00 AM', '1:00 AM', 1, 4, 63, 21, 12),
(26, 3, '7:00 AM', '10:00 AM', 5, 4, 63, 21, 12),
(27, 2, '7:00 AM', '10:00 AM', 4, 4, 38, 21, 12),
(28, 1, '10:00 AM', '12:00 PM', 2, 5, 38, 21, 12),
(29, 1, '7:00 AM', '10:00 AM', 1, 1, 38, 21, 12),
(30, 4, '7:00 AM', '10:00 AM', 7, 4, 38, 21, 12),
(31, 4, '10:00 AM', '12:00 PM', 7, 2, 38, 21, 12),
(32, 3, '12:00 PM', '3:00 PM', 2, 15, 63, 21, 12),
(33, 6, '8:00 AM', '10:00 AM', 4, 11, 63, 21, 12),
(34, 1, '7:00 AM', '10:00 AM', 1, 1, 38, 21, 3);

-- --------------------------------------------------------

--
-- Table structure for table `user_accounts`
--

CREATE TABLE `user_accounts` (
  `id` int(11) NOT NULL,
  `person_id` int(11) DEFAULT NULL,
  `employee_id` varchar(255) DEFAULT NULL,
  `profile_picture` varchar(255) DEFAULT NULL,
  `role` varchar(255) NOT NULL,
  `last_name` varchar(255) DEFAULT NULL,
  `middle_name` varchar(255) DEFAULT NULL,
  `first_name` varchar(255) DEFAULT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `status` int(11) DEFAULT NULL,
  `dprtmnt_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `user_accounts`
--

INSERT INTO `user_accounts` (`id`, `person_id`, `employee_id`, `profile_picture`, `role`, `last_name`, `middle_name`, `first_name`, `email`, `password`, `status`, `dprtmnt_id`) VALUES
(1, 1, NULL, NULL, 'student', NULL, NULL, NULL, 'markmontao2671@gmail.com', '$2b$10$eUcFSQXtFxPNdj7vR/UVCu0Of0Y/CszW7zxQnmKj2x0.akxOQJIZi', 1, NULL),
(2, 4, NULL, NULL, 'student', NULL, NULL, NULL, 'markmontano0626@gmail.com', '$2b$10$1z0TPyKFo6qtCrVAaA1D4e3qANATLI.pyTLqZinmmT8sF2zMALkDu', 1, NULL),
(12, 13, NULL, NULL, 'student', NULL, NULL, NULL, 'benjamin.anderson13@example.com', '$2b$10$QEsrP1R1oVa.eZiqlZRgoeFaaIJSX2ZuR9DhZvArwINLs3mR2a/cm', 0, NULL),
(13, 14, NULL, NULL, 'student', NULL, NULL, NULL, 'ava.thomas14@example.com', '$2b$10$Bqh2HDkbbs0PabLc1ycQpOYj4RBqeb4rR7b/Iu8B5b3mM7cAFPY8W', 0, NULL),
(14, 15, NULL, NULL, 'student', NULL, NULL, NULL, 'ethan.taylor15@example.com', '$2b$10$FkyAfmKmxgsun/3/sf7hUuEPIz6p2Ci5CnlmbbsyImc.ZfwKfJP.W', 0, NULL),
(15, 18, NULL, NULL, 'student', NULL, NULL, NULL, 'mia.martin18@example.com', '$2b$10$pwsagB1vg4PKuXilyZ/hFeLfh7w6yi2b.Ak3j9S2nGDYzKX9gwECO', 0, NULL),
(17, 92, NULL, NULL, 'student', NULL, NULL, NULL, 'mecasio@gmail.com', '$2b$10$CHRiC06CY6QQS4ZpiBlJYePp1TjQti.BlwIXJkc83ojxPM3H11vG.', 1, NULL),
(18, 20, NULL, NULL, 'student', NULL, NULL, NULL, 'markmontano0626@gmail.com', '$2b$10$Sa3mWqcgILIxiL4moR6N.ehbDoNUx87HFWV0cgIlemjdaFaV3yM4O', 1, NULL),
(19, 2, NULL, NULL, 'student', NULL, NULL, NULL, 'emily.johnson2@example.com', '$2b$10$b3WCXkUNAo8MmvwsK14kP.OhNIlAp4BqBIyXgF0cYPI.12IwBV1cy', 0, NULL),
(20, 204, NULL, NULL, 'student', NULL, NULL, NULL, 'lala@example.com', '$2b$10$lDL/0s7dOdohXxChj2EegOXYTKi2FV1IAIKqso4xT7ymlP52Dm5om', 0, NULL),
(21, 3, NULL, NULL, 'student', NULL, NULL, NULL, 'michael.williams3@example.com', '$2b$10$c.5WHhR7zzeOhfj/u6yZKetNbToSGy2SSfK0DyiR0Gra4py/QODz.', 0, NULL),
(22, 12, NULL, NULL, 'student', NULL, NULL, NULL, 'sophia.wilson12@example.com', '$2b$10$x8sYA4mz7RZUtOM6NyAE5uGu/n6bLSWSuWf6UdsZD99/LGpMAiohG', 0, NULL),
(23, 9, NULL, NULL, 'student', NULL, NULL, NULL, 'matthew.martinez9@example.com', '$2b$10$GIjnErBrPJz9CWHKyJDvmeN0juDU9EIHOA7hJ/XvKv4Cwynx13xgK', 0, NULL),
(24, 5, NULL, NULL, 'student', NULL, NULL, NULL, 'david.jones5@example.com', '$2b$10$xB1JZHYUhmOZ2TA/FTk/PuZMypmUS2xdu4qrkUSCR5YuXW28nu7/e', 0, NULL),
(25, 6, NULL, NULL, 'student', NULL, NULL, NULL, 'jessica.garcia6@example.com', '$2b$10$uCB2mBA6gCotNySKK9U8tuzdh/BhRxJDCZcUWxFhhnr3SfxrSV/Mm', 0, NULL),
(26, 7, NULL, NULL, 'student', NULL, NULL, NULL, 'daniel.miller7@example.com', '$2b$10$yUPnF32Lib8xD0WlW4RkpOwE1DTKNoXsNn1PQm/UrWwUpf98ElKvC', 0, NULL),
(27, 8, NULL, NULL, 'student', NULL, NULL, NULL, 'ashley.davis8@example.com', '$2b$10$SLUGkj1rObDjB3uUTJPKP.H.wqWn8o7Y/pNxe2rRvuMNWBYS0E07i', 0, NULL),
(28, 10, NULL, NULL, 'student', NULL, NULL, NULL, 'olivia.lopez10@example.com', '$2b$10$SYtyZ.7gsXN5jA/s2vLvGe31rwESAnY2XoqNgPhs5Jdm/WDrF3gLe', 0, NULL),
(29, 11, NULL, NULL, 'student', NULL, NULL, NULL, 'james.gonzalez11@example.com', '$2b$10$77J/1bIFl856sWJeVhS05OCloZj4CDDdY/VeetnVhbLjpcN/x516i', 0, NULL),
(30, 17, NULL, NULL, 'student', NULL, NULL, NULL, 'alexander.jackson17@example.com', '$2b$10$lrKq4IEVEjl3nEXzmfROtutFeJlmtM3pHG/c532Eo25tEmb8yDnqS', 0, NULL),
(31, 16, NULL, NULL, 'student', NULL, NULL, NULL, 'isabella.moore16@example.com', '$2b$10$yDqQB42dUW1kch4C6ek7QOFmXzEIXq4ufZPPAHtnq8/xShL9XopsC', 0, NULL),
(32, 19, NULL, NULL, 'student', NULL, NULL, NULL, 'william.lee19@example.com', '$2b$10$b3FWglvmXDJd5sJHSjIu/.Xm1pfD6oFd8O7PPZMIPYFEQK5xko722', 0, NULL),
(33, 21, NULL, NULL, 'student', NULL, NULL, NULL, 'henry.thompson21@example.com', '$2b$10$L948ZL4YER9ajIybEdnwxOIy1dRXkXyJgA2S84HXjzv0BtPkDKtta', 0, NULL),
(34, 22, NULL, NULL, 'student', NULL, NULL, NULL, 'amelia.white22@example.com', '$2b$10$Kw3/vOhjQ40JYmW1Pib.ZesDmWlatEuGmbYKImwIFoZiS1wJWwdmW', 0, NULL),
(35, 23, NULL, NULL, 'student', NULL, NULL, NULL, 'lucas.harris23@example.com', '$2b$10$BtklOyJxSxY6xA0DeEJVB.YLrI1KklMZPrcOcpcEw.1K5G6Itut/G', 0, NULL),
(36, 25, NULL, NULL, 'student', NULL, NULL, NULL, 'mason.clark25@example.com', '$2b$10$Cx.IbPfNEnJRUPNXwy3Cce3cvrDFSE529oO9Whxn3IXNJQXpwfmvK', 0, NULL),
(37, 24, NULL, NULL, 'student', NULL, NULL, NULL, 'harper.sanchez24@example.com', '$2b$10$aYc9guxBB3btzPRYMKp2zOj1e9TYqOnGUdPSUHeZExtdEXKcFIiNm', 0, NULL),
(38, 28, NULL, NULL, 'student', NULL, NULL, NULL, 'grace.robinson28@example.com', '$2b$10$WgTq.Hzr/LyluvsdMNQeD.wdWurcXWr42ZqpMYN1HJuMXNel.kOFa', 0, NULL),
(39, 29, NULL, NULL, 'student', NULL, NULL, NULL, 'elijah.walker29@example.com', '$2b$10$xCNZujvCh7y7SHWPv2rCw.7ohpNT8DsGgqaiW7AAnZ3tMcNwK5yz6', 0, NULL),
(40, 30, NULL, NULL, 'student', NULL, NULL, NULL, 'chloe.young30@example.com', '$2b$10$YNaFSyQkD7YK8LDDFIzrOuMVagG4gs15cAXWtq7tSTDfCP575GZjC', 0, NULL),
(41, 27, NULL, NULL, 'student', NULL, NULL, NULL, 'logan.lewis27@example.com', '$2b$10$TRyLbr7cG9msP8gNiwvZe.XzW7ngEZC8XtImHNqSHjWD/1mktKE9.', 0, NULL),
(42, 26, NULL, NULL, 'student', NULL, NULL, NULL, 'ella.ramirez26@example.com', '$2b$10$jOESzkksdee6I4bXDuFzVejbGrGO5SYTpEmSwbEGOGLpJxhSa./ZS', 0, NULL),
(43, 32, NULL, NULL, 'student', NULL, NULL, NULL, 'lily.king32@example.com', '$2b$10$kdio48ZmdPSrfGe38ijDT.ZIru99Nc5HlyCpnTTOrscASzUf6EpLu', 0, NULL),
(44, 31, NULL, NULL, 'student', NULL, NULL, NULL, 'aiden.allen31@example.com', '$2b$10$G3iW.HVT4FwI1OE0k6Z6fu7y3/Ytjgo1AKTIRb.hbh2.UhZJJtAV6', 0, NULL),
(45, 34, NULL, NULL, 'student', NULL, NULL, NULL, 'zoe.scott34@example.com', '$2b$10$w3JLGR5raLYF72GZF7Cg5OMYknrl10yNk6R1xHUR7J3pO8LLjOMhC', 0, NULL),
(46, 33, NULL, NULL, 'student', NULL, NULL, NULL, 'joseph.wright33@example.com', '$2b$10$Hd3H6DNraCr71M2lR28jieJ2OMm76cbVsxI2VGIcUkF3Nu8mOfLGe', 0, NULL),
(47, 36, NULL, NULL, 'student', NULL, NULL, NULL, 'aria.nguyen36@example.com', '$2b$10$elMQt7tcF0CPAkDPDn29ven00mfq/uufhlYdK28m9IrY6gWf7tvRu', 0, NULL),
(48, 37, NULL, NULL, 'student', NULL, NULL, NULL, 'sebastian.hill37@example.com', '$2b$10$ub.IGUTH1Lw.UNpkHN9J6.IvXfGpgrZrbgG9lzKzqOWTTLQcyZ7RG', 0, NULL),
(49, 35, NULL, NULL, 'student', NULL, NULL, NULL, 'samuel.torres35@example.com', '$2b$10$ocYU7Jw3jnPh8mOE14RLf.l30kgOosdn3Q9xYixfdk7lfd1KFn5Lm', 0, NULL),
(50, 38, NULL, NULL, 'student', NULL, NULL, NULL, 'avery.green38@example.com', '$2b$10$r/q7Xf2JdRBxRi6fwobCV.B2yv2NmLQm81au69TLH59qavqQysk3W', 0, NULL),
(51, 40, NULL, NULL, 'student', NULL, NULL, NULL, 'scarlett.baker40@example.com', '$2b$10$DYB6vWwb2thF/BjqpGS2uu44IdzbyVjC01Ql/wTgf7PNs.1x2G3Fe', 0, NULL),
(52, 39, NULL, NULL, 'student', NULL, NULL, NULL, 'jack.adams39@example.com', '$2b$10$L9TruFyFdfq6L2O25uMS6egOVldkvz/IiG02mP.fe0mmBxyqDfZRW', 0, NULL),
(53, 41, NULL, NULL, 'student', NULL, NULL, NULL, 'owen.gonzalez41@example.com', '$2b$10$O48lr2ngBTmMZNbw9cv//emrL5oQcqzWKSlmJxBboaucFRf8/YcHi', 0, NULL),
(54, 42, NULL, NULL, 'student', NULL, NULL, NULL, 'hannah.nelson42@example.com', '$2b$10$YLi61NOZZGz30lWVLdXTJ.4jFNAaDyYgo6yhB0g3T1KCPPOWdOMNu', 0, NULL),
(55, 43, NULL, NULL, 'student', NULL, NULL, NULL, 'wyatt.carter43@example.com', '$2b$10$nJFc/y70LWlHLZT5gB7hCukqrH5.1o6BtiI28mK79YtCeSgHvBfXm', 0, NULL),
(56, 44, NULL, NULL, 'student', NULL, NULL, NULL, 'abigail.mitchell44@example.com', '$2b$10$adSDdayCqHCIMNvfdSyAieBy6NGHyQbqwb8.bE8N8CLkw0LTCDh0G', 0, NULL),
(57, 45, NULL, NULL, 'student', NULL, NULL, NULL, 'luke.perez45@example.com', '$2b$10$y5KC0f7Y3UlessSEkMg6iebSpBpXTEcy9p5oImWVzcODTdH5moZEO', 0, NULL),
(58, 47, NULL, NULL, 'student', NULL, NULL, NULL, 'jayden.evans47@example.com', '$2b$10$ehjUz6.Cfvw/wu2kOiM6NetpIhku5cg/Xuh3oX/bL0/W3dPjsu/sC', 0, NULL),
(59, 48, NULL, NULL, 'student', NULL, NULL, NULL, 'sofia.turner48@example.com', '$2b$10$Ntcgs0uNXl.SR2W9S22Ra.A2nWW2Lp.7/vPJdGvWs1mrTk1wu6Md6', 0, NULL),
(60, 46, NULL, NULL, 'student', NULL, NULL, NULL, 'madison.roberts46@example.com', '$2b$10$viL15McT3qLBvUByRrK22O0qPY8uUTZowF73DilXCJCdJLqBQ13qa', 0, NULL),
(61, 49, NULL, NULL, 'student', NULL, NULL, NULL, 'gabriel.phillips49@example.com', '$2b$10$x3YrgGDIuE6bwBuPUJpvA.6xpc7jjk8Zsx8gGsoGMLKu6qPyIRVEO', 0, NULL),
(62, 51, NULL, NULL, 'student', NULL, NULL, NULL, 'carter.parker51@example.com', '$2b$10$EnaIi5IjdlIkvPDC2UsKouy8NG.J8VOTBdCuO3dl7jILhrbhL47/C', 0, NULL),
(63, 50, NULL, NULL, 'student', NULL, NULL, NULL, 'ella.campbell50@example.com', '$2b$10$69TfBE9F/Sh1knRGKozZE.5o8gu/gkNM0wjiVTMRNW79Thj8b/3tq', 0, NULL),
(64, 52, NULL, NULL, 'student', NULL, NULL, NULL, 'victoria.edwards52@example.com', '$2b$10$x/9Keo8.oEvzG2Oa3rlZIe8RcRohGAX4Sq56nemgcz0Ii6fYnu/6m', 0, NULL),
(65, 54, NULL, NULL, 'student', NULL, NULL, NULL, 'penelope.stewart54@example.com', '$2b$10$m3WVl7feor74lpAw6AQ2aeP.wyT2X7jFX4NrS3tItNWV.Jj7UiLV.', 0, NULL),
(66, 53, NULL, NULL, 'student', NULL, NULL, NULL, 'isaac.collins53@example.com', '$2b$10$KUUqikh3gV4HJvs3gmwp4uZwFl56akR/IJF95BuvmqJ2cRyVJnaCi', 0, NULL),
(67, 55, NULL, NULL, 'student', NULL, NULL, NULL, 'dylan.morris55@example.com', '$2b$10$W17qvkhVoWk/TfkWzV98f.xHpMhbk5SBUi7/NN7m6er0OV7Sg33i2', 0, NULL),
(68, 56, NULL, NULL, 'student', NULL, NULL, NULL, 'layla.rogers56@example.com', '$2b$10$Cu435uLyMCip4vOTXM5XSu4As3NLF7w0OwDT0SdiAjGlVOI3Tjk36', 0, NULL),
(69, 58, NULL, NULL, 'student', NULL, NULL, NULL, 'zoey.cook58@example.com', '$2b$10$UQIvAkxQbphM.HAVsPA2lOyugk4Acdg32CVIIijEXoUAN2ZcBSVYW', 0, NULL),
(70, 57, NULL, NULL, 'student', NULL, NULL, NULL, 'nathan.reed57@example.com', '$2b$10$jnUt93mOT7dY3lOJ7GAkMutqEzQIg3FR42FBIs.CRiYbZyrD0NCly', 0, NULL),
(71, 59, NULL, NULL, 'student', NULL, NULL, NULL, 'levi.morgan59@example.com', '$2b$10$b9kBNyc6ZfQLV1TIB2Jm5.NSQhp8YsQMItIxnJTA6otBZWuoYd6lS', 0, NULL),
(72, 60, NULL, NULL, 'student', NULL, NULL, NULL, 'mecasio.a.bsinfotech@gmail.com', '$2b$10$mgM73SADDUd.J5AZmNh38.0t9LQaQLbpQC/fCNYGH/1dB.KRy567q', 1, NULL),
(73, 61, '224-06342M', 'undefined_profile.jpg', 'registrar', 'Montano', 'Placido', 'Mark Anthony', 'markmontano522@gmail.com', '$2b$10$eUcFSQXtFxPNdj7vR/UVCu0Of0Y/CszW7zxQnmKj2x0.akxOQJIZi', 1, 1),
(74, 306, NULL, NULL, 'student', NULL, NULL, NULL, 'delacruz.lc.bsinfotech@gmail.com', '$2b$10$0euJr9pUR.su/PpmOIENd..YKBEZCP/aBsKhjyfnmWsE1kJyRb56a', NULL, NULL),
(75, 307, NULL, NULL, 'student', NULL, NULL, NULL, 'montano.ma.bsinfotech@gmail.com', '$2b$10$KtKN9/cT9fuTOPJzEe6TLOSkcMF61D.WIN8Mh5p2l40f2aLH2SXna', NULL, NULL),
(76, 309, NULL, NULL, 'student', NULL, NULL, NULL, 'montano.ma.bsinfotech@gmail.com', '$2b$10$wzhCvWPfpU.hKrvkpf/m..LDAv4lbMSTXzHWsxliegtvNB3AXoR9u', NULL, NULL),
(77, 323, NULL, NULL, 'student', NULL, NULL, NULL, 'montano.ma.bsinfotech@gmail.com', '$2b$10$XnfO0iS1WJD.TN75/oesJ.vKbrYdueEa65axVeSwraKm7OMZb/wZG', NULL, NULL),
(78, 1358, NULL, NULL, 'registrar', 'Pedro', 'Juan', 'Penduco', 'markmontano111@gmail.com', '$2b$10$uk40j.VZLXGZClaAd3Upr.I7dDtu2y05KNO7H9y18Wf41vzT5Y8T6', 1, 2),
(79, 1381, '111111', NULL, 'registrar', 'Dhani', 'D. ', 'San Jose', 'disanjose@gmail.com', '$2b$10$gT9D98Juy/tht8U.ZIUwyecnp4BPpOECKwzVuR6CvYw6UkxQmnHdO', 1, 3);

-- --------------------------------------------------------

--
-- Table structure for table `year_level_table`
--

CREATE TABLE `year_level_table` (
  `year_level_id` int(11) NOT NULL,
  `year_level_description` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `year_level_table`
--

INSERT INTO `year_level_table` (`year_level_id`, `year_level_description`) VALUES
(1, 'First Year'),
(2, 'Second Year'),
(3, 'Third Year'),
(4, 'Fourth Year'),
(5, 'Fifth Year');

-- --------------------------------------------------------

--
-- Table structure for table `year_table`
--

CREATE TABLE `year_table` (
  `year_id` int(11) NOT NULL,
  `year_description` int(11) NOT NULL,
  `status` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `year_table`
--

INSERT INTO `year_table` (`year_id`, `year_description`, `status`) VALUES
(1, 2016, 0),
(2, 2017, 0),
(3, 2018, 0),
(4, 2019, 0),
(5, 2020, 0),
(6, 2021, 0),
(7, 2022, 0),
(8, 2023, 0),
(9, 2024, 0),
(10, 2025, 1),
(11, 2026, 0),
(12, 2027, 0),
(13, 2028, 0),
(14, 2029, 0),
(15, 2030, 0),
(16, 2031, 0);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `active_school_year_table`
--
ALTER TABLE `active_school_year_table`
  ADD PRIMARY KEY (`id`),
  ADD KEY `year_id` (`year_id`),
  ADD KEY `semester_id` (`semester_id`);

--
-- Indexes for table `course_table`
--
ALTER TABLE `course_table`
  ADD PRIMARY KEY (`course_id`);

--
-- Indexes for table `curriculum_table`
--
ALTER TABLE `curriculum_table`
  ADD PRIMARY KEY (`curriculum_id`);

--
-- Indexes for table `dprtmnt_curriculum_table`
--
ALTER TABLE `dprtmnt_curriculum_table`
  ADD PRIMARY KEY (`dprtmnt_curriculum_id`),
  ADD KEY `dprtmnt_id` (`dprtmnt_id`),
  ADD KEY `curriculum_id` (`curriculum_id`);

--
-- Indexes for table `dprtmnt_profs_table`
--
ALTER TABLE `dprtmnt_profs_table`
  ADD PRIMARY KEY (`dprtmnt_profs_id`),
  ADD KEY `dprtmnt_id` (`dprtmnt_id`),
  ADD KEY `prof_id` (`prof_id`);

--
-- Indexes for table `dprtmnt_room_table`
--
ALTER TABLE `dprtmnt_room_table`
  ADD PRIMARY KEY (`dprtmnt_room_id`),
  ADD KEY `dprtmnt_id` (`dprtmnt_id`),
  ADD KEY `room_id` (`room_id`);

--
-- Indexes for table `dprtmnt_section_table`
--
ALTER TABLE `dprtmnt_section_table`
  ADD PRIMARY KEY (`id`),
  ADD KEY `curriculum_id` (`curriculum_id`),
  ADD KEY `section_id` (`section_id`);

--
-- Indexes for table `dprtmnt_table`
--
ALTER TABLE `dprtmnt_table`
  ADD PRIMARY KEY (`dprtmnt_id`);

--
-- Indexes for table `enrolled_subject`
--
ALTER TABLE `enrolled_subject`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `evaluation_table`
--
ALTER TABLE `evaluation_table`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `medical_requirements`
--
ALTER TABLE `medical_requirements`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `page_access`
--
ALTER TABLE `page_access`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `page_table`
--
ALTER TABLE `page_table`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `period_status`
--
ALTER TABLE `period_status`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `person_prof_table`
--
ALTER TABLE `person_prof_table`
  ADD PRIMARY KEY (`person_id`);

--
-- Indexes for table `person_status_table`
--
ALTER TABLE `person_status_table`
  ADD PRIMARY KEY (`id`),
  ADD KEY `person_id` (`person_id`);

--
-- Indexes for table `person_table`
--
ALTER TABLE `person_table`
  ADD PRIMARY KEY (`person_id`);

--
-- Indexes for table `prof_table`
--
ALTER TABLE `prof_table`
  ADD PRIMARY KEY (`prof_id`);

--
-- Indexes for table `program_table`
--
ALTER TABLE `program_table`
  ADD PRIMARY KEY (`program_id`);

--
-- Indexes for table `program_tagging_table`
--
ALTER TABLE `program_tagging_table`
  ADD PRIMARY KEY (`program_tagging_id`);

--
-- Indexes for table `question_table`
--
ALTER TABLE `question_table`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `requirements_table`
--
ALTER TABLE `requirements_table`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `requirement_uploads`
--
ALTER TABLE `requirement_uploads`
  ADD PRIMARY KEY (`upload_id`);

--
-- Indexes for table `room_day_table`
--
ALTER TABLE `room_day_table`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `room_table`
--
ALTER TABLE `room_table`
  ADD PRIMARY KEY (`room_id`);

--
-- Indexes for table `school_time_table`
--
ALTER TABLE `school_time_table`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `section_table`
--
ALTER TABLE `section_table`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `semester_table`
--
ALTER TABLE `semester_table`
  ADD PRIMARY KEY (`semester_id`);

--
-- Indexes for table `student_counter`
--
ALTER TABLE `student_counter`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `student_curriculum_table`
--
ALTER TABLE `student_curriculum_table`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `student_evaluation_table`
--
ALTER TABLE `student_evaluation_table`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `student_grade_overall_table`
--
ALTER TABLE `student_grade_overall_table`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `student_numbering_table`
--
ALTER TABLE `student_numbering_table`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `student_status_table`
--
ALTER TABLE `student_status_table`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `time_table`
--
ALTER TABLE `time_table`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `user_accounts`
--
ALTER TABLE `user_accounts`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `year_level_table`
--
ALTER TABLE `year_level_table`
  ADD PRIMARY KEY (`year_level_id`);

--
-- Indexes for table `year_table`
--
ALTER TABLE `year_table`
  ADD PRIMARY KEY (`year_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `active_school_year_table`
--
ALTER TABLE `active_school_year_table`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT for table `course_table`
--
ALTER TABLE `course_table`
  MODIFY `course_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=85;

--
-- AUTO_INCREMENT for table `curriculum_table`
--
ALTER TABLE `curriculum_table`
  MODIFY `curriculum_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=58;

--
-- AUTO_INCREMENT for table `dprtmnt_curriculum_table`
--
ALTER TABLE `dprtmnt_curriculum_table`
  MODIFY `dprtmnt_curriculum_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=58;

--
-- AUTO_INCREMENT for table `dprtmnt_profs_table`
--
ALTER TABLE `dprtmnt_profs_table`
  MODIFY `dprtmnt_profs_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=53;

--
-- AUTO_INCREMENT for table `dprtmnt_room_table`
--
ALTER TABLE `dprtmnt_room_table`
  MODIFY `dprtmnt_room_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=24;

--
-- AUTO_INCREMENT for table `dprtmnt_section_table`
--
ALTER TABLE `dprtmnt_section_table`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=517;

--
-- AUTO_INCREMENT for table `dprtmnt_table`
--
ALTER TABLE `dprtmnt_table`
  MODIFY `dprtmnt_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- AUTO_INCREMENT for table `enrolled_subject`
--
ALTER TABLE `enrolled_subject`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=733;

--
-- AUTO_INCREMENT for table `evaluation_table`
--
ALTER TABLE `evaluation_table`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `medical_requirements`
--
ALTER TABLE `medical_requirements`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `page_access`
--
ALTER TABLE `page_access`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=68;

--
-- AUTO_INCREMENT for table `page_table`
--
ALTER TABLE `page_table`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=42;

--
-- AUTO_INCREMENT for table `period_status`
--
ALTER TABLE `period_status`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `person_prof_table`
--
ALTER TABLE `person_prof_table`
  MODIFY `person_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=41;

--
-- AUTO_INCREMENT for table `person_status_table`
--
ALTER TABLE `person_status_table`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `person_table`
--
ALTER TABLE `person_table`
  MODIFY `person_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1382;

--
-- AUTO_INCREMENT for table `prof_table`
--
ALTER TABLE `prof_table`
  MODIFY `prof_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=66;

--
-- AUTO_INCREMENT for table `program_table`
--
ALTER TABLE `program_table`
  MODIFY `program_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=59;

--
-- AUTO_INCREMENT for table `program_tagging_table`
--
ALTER TABLE `program_tagging_table`
  MODIFY `program_tagging_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=81;

--
-- AUTO_INCREMENT for table `question_table`
--
ALTER TABLE `question_table`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `requirements_table`
--
ALTER TABLE `requirements_table`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=36;

--
-- AUTO_INCREMENT for table `requirement_uploads`
--
ALTER TABLE `requirement_uploads`
  MODIFY `upload_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=183;

--
-- AUTO_INCREMENT for table `room_day_table`
--
ALTER TABLE `room_day_table`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `room_table`
--
ALTER TABLE `room_table`
  MODIFY `room_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=29;

--
-- AUTO_INCREMENT for table `school_time_table`
--
ALTER TABLE `school_time_table`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=30;

--
-- AUTO_INCREMENT for table `section_table`
--
ALTER TABLE `section_table`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `semester_table`
--
ALTER TABLE `semester_table`
  MODIFY `semester_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `student_counter`
--
ALTER TABLE `student_counter`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `student_curriculum_table`
--
ALTER TABLE `student_curriculum_table`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `student_evaluation_table`
--
ALTER TABLE `student_evaluation_table`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;

--
-- AUTO_INCREMENT for table `student_grade_overall_table`
--
ALTER TABLE `student_grade_overall_table`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `student_numbering_table`
--
ALTER TABLE `student_numbering_table`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=123;

--
-- AUTO_INCREMENT for table `student_status_table`
--
ALTER TABLE `student_status_table`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=100;

--
-- AUTO_INCREMENT for table `time_table`
--
ALTER TABLE `time_table`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=35;

--
-- AUTO_INCREMENT for table `user_accounts`
--
ALTER TABLE `user_accounts`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=80;

--
-- AUTO_INCREMENT for table `year_level_table`
--
ALTER TABLE `year_level_table`
  MODIFY `year_level_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `year_table`
--
ALTER TABLE `year_table`
  MODIFY `year_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
