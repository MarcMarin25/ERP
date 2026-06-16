-- phpMyAdmin SQL Dump
-- version 5.2.3
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3306
-- Generation Time: Mar 25, 2026 at 07:30 AM
-- Server version: 8.4.6-6
-- PHP Version: 8.1.33

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `ddgnsdb`
--

-- --------------------------------------------------------

--
-- Table structure for table `action_verifications`
--

CREATE TABLE `action_verifications` (
  `id` bigint UNSIGNED NOT NULL,
  `user_id` bigint UNSIGNED NOT NULL,
  `action` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `code` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `expires_at` timestamp NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `boundary_contracts`
--

CREATE TABLE `boundary_contracts` (
  `id` bigint UNSIGNED NOT NULL,
  `status_id` bigint UNSIGNED NOT NULL,
  `franchise_id` bigint UNSIGNED DEFAULT NULL,
  `driver_id` bigint UNSIGNED NOT NULL,
  `vehicle_id` bigint UNSIGNED NOT NULL,
  `name` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `currency` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PHP',
  `coverage_area` text COLLATE utf8mb4_unicode_ci,
  `contract_terms` text COLLATE utf8mb4_unicode_ci,
  `start_date` date NOT NULL,
  `end_date` date DEFAULT NULL,
  `renewal_terms` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `cache`
--

CREATE TABLE `cache` (
  `key` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `value` mediumtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `expiration` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `cache_locks`
--

CREATE TABLE `cache_locks` (
  `key` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `owner` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `expiration` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `chat_messages`
--

CREATE TABLE `chat_messages` (
  `id` bigint UNSIGNED NOT NULL,
  `room_id` bigint UNSIGNED NOT NULL,
  `sender_id` bigint UNSIGNED NOT NULL,
  `sender_type` enum('passenger','driver') COLLATE utf8mb4_unicode_ci NOT NULL,
  `message` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_read` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `chat_rooms`
--

CREATE TABLE `chat_rooms` (
  `id` bigint UNSIGNED NOT NULL,
  `route_id` bigint UNSIGNED NOT NULL,
  `passenger_id` bigint UNSIGNED NOT NULL,
  `driver_id` bigint UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `expenses`
--

CREATE TABLE `expenses` (
  `id` bigint UNSIGNED NOT NULL,
  `franchise_id` bigint UNSIGNED DEFAULT NULL,
  `maintenance_id` bigint UNSIGNED NOT NULL,
  `invoice_no` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `payment_date` datetime DEFAULT NULL,
  `amount` decimal(10,2) NOT NULL,
  `currency` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PHP',
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `failed_jobs`
--

CREATE TABLE `failed_jobs` (
  `id` bigint UNSIGNED NOT NULL,
  `uuid` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `connection` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `queue` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `exception` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `feedback`
--

CREATE TABLE `feedback` (
  `id` bigint UNSIGNED NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_type_id` bigint UNSIGNED NOT NULL,
  `avatar` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `rating` decimal(2,1) NOT NULL COMMENT 'Star rating from 1.0 to 5.0 (0.5 increments)',
  `description` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `franchises`
--

CREATE TABLE `franchises` (
  `id` bigint UNSIGNED NOT NULL,
  `owner_id` bigint UNSIGNED NOT NULL,
  `manager_id` bigint UNSIGNED DEFAULT NULL,
  `status_id` bigint UNSIGNED NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `address` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `region` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `province` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `city` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `barangay` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `postal_code` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `latitude` decimal(10,8) DEFAULT NULL,
  `longitude` decimal(11,8) DEFAULT NULL,
  `contract_attachment` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `dti_registration_attachment` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `mayor_permit_attachment` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `proof_agreement_attachment` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `franchise_user_driver`
--

CREATE TABLE `franchise_user_driver` (
  `franchise_id` bigint UNSIGNED NOT NULL,
  `user_driver_id` bigint UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `franchise_user_technician`
--

CREATE TABLE `franchise_user_technician` (
  `franchise_id` bigint UNSIGNED NOT NULL,
  `user_technician_id` bigint UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `inventories`
--

CREATE TABLE `inventories` (
  `id` bigint UNSIGNED NOT NULL,
  `franchise_id` bigint UNSIGNED NOT NULL,
  `code_no` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `category` enum('Electrical','Mechanical','Safety Equipment','Consumables','Other') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Other',
  `specification` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `quantity` int NOT NULL,
  `unit_price` decimal(10,2) NOT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `jobs`
--

CREATE TABLE `jobs` (
  `id` bigint UNSIGNED NOT NULL,
  `queue` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `attempts` tinyint UNSIGNED NOT NULL,
  `reserved_at` int UNSIGNED DEFAULT NULL,
  `available_at` int UNSIGNED NOT NULL,
  `created_at` int UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `job_batches`
--

CREATE TABLE `job_batches` (
  `id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `total_jobs` int NOT NULL,
  `pending_jobs` int NOT NULL,
  `failed_jobs` int NOT NULL,
  `failed_job_ids` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `options` mediumtext COLLATE utf8mb4_unicode_ci,
  `cancelled_at` int DEFAULT NULL,
  `created_at` int NOT NULL,
  `finished_at` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `maintenances`
--

CREATE TABLE `maintenances` (
  `id` bigint UNSIGNED NOT NULL,
  `vehicle_id` bigint UNSIGNED NOT NULL,
  `status_id` bigint UNSIGNED NOT NULL DEFAULT '6',
  `technician_id` bigint UNSIGNED DEFAULT NULL,
  `inventory_id` bigint UNSIGNED NOT NULL,
  `quantity` int NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `maintenance_date` date NOT NULL,
  `next_maintenance_date` date NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `migrations`
--

CREATE TABLE `migrations` (
  `id` int UNSIGNED NOT NULL,
  `migration` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `batch` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `migrations`
--

INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES
(1, '0001_01_01_000000_create_users_table', 1),
(2, '0001_01_01_000001_create_cache_table', 1),
(3, '0001_01_01_000002_create_jobs_table', 1),
(4, '2025_08_14_170933_add_two_factor_columns_to_users_table', 1),
(5, '2025_11_05_160610_create_user_types_table', 1),
(6, '2025_11_05_161729_add_columns_to_users_table', 1),
(7, '2025_11_05_162201_create_statuses_table', 1),
(8, '2025_11_05_162920_create_payment_options_table', 1),
(9, '2025_11_05_163558_create_user_drivers_table', 1),
(10, '2025_11_05_164908_create_user_owners_table', 1),
(11, '2025_11_05_170352_create_user_passengers_table', 1),
(12, '2025_11_05_195801_create_user_technicians_table', 1),
(13, '2025_11_05_201236_create_user_managers_table', 1),
(14, '2025_11_05_201928_create_franchises_table', 1),
(15, '2025_11_05_211526_create_franchise_user_driver_table', 1),
(16, '2025_11_05_211747_create_franchise_user_technician_table', 1),
(17, '2025_11_06_141158_create_vehicles_table', 1),
(18, '2025_11_06_141244_create_boundary_contracts_table', 1),
(19, '2025_11_06_141245_create_revenues_table', 1),
(20, '2025_11_06_144002_create_routes_table', 1),
(21, '2025_11_06_150924_create_violations_table', 1),
(22, '2025_11_06_153736_create_inventories_table', 1),
(23, '2025_11_06_153844_create_maintenances_table', 1),
(24, '2025_11_06_153910_create_expenses_table', 1),
(25, '2025_11_06_153925_create_ratings_table', 1),
(26, '2025_11_17_104509_create_percentage_types_table', 1),
(27, '2025_11_17_110509_create_revenue_breakdowns_table', 1),
(28, '2025_12_03_170349_add_status_and_technician_id_to_maintenances_table', 1),
(29, '2025_12_13_153535_create_support_tickets_table', 1),
(30, '2026_01_05_105251_create_feedback_table', 1),
(31, '2026_01_08_115717_create_action_verifications_table', 1),
(32, '2026_01_09_153302_create_tips_table', 1),
(33, '2026_03_16_131107_create_chat_rooms_table', 1),
(34, '2026_03_16_131323_create_chat_messages_table', 1);

-- --------------------------------------------------------

--
-- Table structure for table `password_reset_tokens`
--

CREATE TABLE `password_reset_tokens` (
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `payment_options`
--

CREATE TABLE `payment_options` (
  `id` bigint UNSIGNED NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `payment_options`
--

INSERT INTO `payment_options` (`id`, `name`) VALUES
(1, 'Cash'),
(2, 'Credit Card'),
(3, 'Gcash'),
(4, 'Paymaya');

-- --------------------------------------------------------

--
-- Table structure for table `percentage_types`
--

CREATE TABLE `percentage_types` (
  `id` bigint UNSIGNED NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` enum('Percentage','PHP') COLLATE utf8mb4_unicode_ci NOT NULL,
  `value` decimal(8,2) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `percentage_types`
--

INSERT INTO `percentage_types` (`id`, `name`, `type`, `value`, `created_at`, `updated_at`) VALUES
(1, 'tax', 'Percentage', 1.00, NULL, NULL),
(2, 'bank', 'Percentage', 1.00, NULL, NULL),
(3, 'markup_fee', 'PHP', 10.00, NULL, NULL),
(4, 'system_fee', 'PHP', 10.00, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `ratings`
--

CREATE TABLE `ratings` (
  `id` bigint UNSIGNED NOT NULL,
  `driver_id` bigint UNSIGNED NOT NULL,
  `passenger_id` bigint UNSIGNED NOT NULL,
  `route_id` bigint UNSIGNED NOT NULL,
  `stars` int UNSIGNED DEFAULT NULL,
  `comment` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `report_issue`
--

CREATE TABLE `report_issue` (
  `id` int NOT NULL,
  `route_id` bigint NOT NULL,
  `passenger_id` bigint NOT NULL,
  `driver_id` bigint NOT NULL,
  `report_details` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `created_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `revenues`
--

CREATE TABLE `revenues` (
  `id` bigint UNSIGNED NOT NULL,
  `status_id` bigint UNSIGNED NOT NULL,
  `franchise_id` bigint UNSIGNED DEFAULT NULL,
  `driver_id` bigint UNSIGNED DEFAULT NULL,
  `boundary_contract_id` bigint UNSIGNED DEFAULT NULL,
  `payment_option_id` bigint UNSIGNED DEFAULT NULL,
  `invoice_no` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `amount` decimal(10,2) NOT NULL,
  `currency` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PHP',
  `service_type` enum('Trips','Boundary') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Trips',
  `payment_date` datetime DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `revenue_breakdowns`
--

CREATE TABLE `revenue_breakdowns` (
  `id` bigint UNSIGNED NOT NULL,
  `revenue_id` bigint UNSIGNED NOT NULL,
  `percentage_type_id` bigint UNSIGNED NOT NULL,
  `total_earning` decimal(8,2) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `routes`
--

CREATE TABLE `routes` (
  `id` bigint UNSIGNED NOT NULL,
  `status_id` bigint UNSIGNED NOT NULL,
  `driver_id` bigint UNSIGNED DEFAULT NULL,
  `vehicle_id` bigint UNSIGNED DEFAULT NULL,
  `passenger_id` bigint UNSIGNED NOT NULL,
  `revenue_id` bigint UNSIGNED DEFAULT NULL,
  `start_trip` datetime DEFAULT NULL,
  `end_trip` datetime DEFAULT NULL,
  `start_lat` decimal(10,8) NOT NULL,
  `start_lng` decimal(11,8) NOT NULL,
  `end_lat` decimal(10,8) DEFAULT NULL,
  `end_lng` decimal(11,8) DEFAULT NULL,
  `distance_km` decimal(10,2) DEFAULT NULL,
  `average_speed_kmh` decimal(6,2) DEFAULT NULL,
  `max_speed_kmh` decimal(6,2) DEFAULT NULL,
  `route_path` text COLLATE utf8mb4_unicode_ci,
  `is_favorite` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `sessions`
--

CREATE TABLE `sessions` (
  `id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` bigint UNSIGNED DEFAULT NULL,
  `ip_address` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_agent` text COLLATE utf8mb4_unicode_ci,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `last_activity` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `statuses`
--

CREATE TABLE `statuses` (
  `id` bigint UNSIGNED NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `statuses`
--

INSERT INTO `statuses` (`id`, `name`) VALUES
(1, 'active'),
(15, 'available'),
(9, 'cancelled'),
(16, 'completed'),
(12, 'confirm_pick_up'),
(18, 'deny'),
(14, 'end_trip'),
(2, 'inactive'),
(5, 'maintenance'),
(7, 'overdue'),
(8, 'paid'),
(6, 'pending'),
(10, 'que'),
(4, 'retired'),
(13, 'start_trip'),
(3, 'suspended'),
(11, 'to_pick_up'),
(17, 'up_coming');

-- --------------------------------------------------------

--
-- Table structure for table `support_tickets`
--

CREATE TABLE `support_tickets` (
  `id` bigint UNSIGNED NOT NULL,
  `ticket_code` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status_id` bigint UNSIGNED NOT NULL,
  `user_id` bigint UNSIGNED NOT NULL,
  `franchise_id` bigint UNSIGNED DEFAULT NULL,
  `type` enum('Payment Dispute','Adjustment Request') COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `date` date NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `tips`
--

CREATE TABLE `tips` (
  `id` bigint UNSIGNED NOT NULL,
  `passenger_id` bigint UNSIGNED NOT NULL,
  `driver_id` bigint UNSIGNED DEFAULT NULL,
  `amount` tinyint NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` bigint UNSIGNED NOT NULL,
  `user_type_id` bigint UNSIGNED NOT NULL,
  `username` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `phone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone_verified_at` timestamp NULL DEFAULT NULL,
  `gender` enum('Male','Female','Other','Prefer not to say') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `address` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `region` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `province` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `city` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `barangay` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `postal_code` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `two_factor_secret` text COLLATE utf8mb4_unicode_ci,
  `two_factor_recovery_codes` text COLLATE utf8mb4_unicode_ci,
  `two_factor_confirmed_at` timestamp NULL DEFAULT NULL,
  `remember_token` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `user_drivers`
--

CREATE TABLE `user_drivers` (
  `id` bigint UNSIGNED NOT NULL,
  `status_id` bigint UNSIGNED NOT NULL,
  `code_number` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `license_number` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_verified` tinyint(1) NOT NULL DEFAULT '0',
  `is_online` tinyint(1) NOT NULL DEFAULT '0',
  `latitude` decimal(10,8) DEFAULT NULL,
  `longitude` decimal(11,8) DEFAULT NULL,
  `license_expiry` date NOT NULL,
  `front_license_picture` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `back_license_picture` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nbi_clearance` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `selfie_picture` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `shift` enum('Morning','Evening','Night') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Morning',
  `hire_date` date DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `user_managers`
--

CREATE TABLE `user_managers` (
  `id` bigint UNSIGNED NOT NULL,
  `status_id` bigint UNSIGNED NOT NULL,
  `valid_id_type` enum('National ID','Passport','Driver License','Voter ID','Unified Multi-Purpose ID','TIN ID') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'National ID',
  `valid_id_number` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `front_valid_id_picture` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `back_valid_id_picture` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `user_owners`
--

CREATE TABLE `user_owners` (
  `id` bigint UNSIGNED NOT NULL,
  `status_id` bigint UNSIGNED NOT NULL,
  `valid_id_type` enum('National ID','Passport','Driver License','Voter ID','Unified Multi-Purpose ID','TIN ID') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'National ID',
  `valid_id_number` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `front_valid_id_picture` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `back_valid_id_picture` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `user_passengers`
--

CREATE TABLE `user_passengers` (
  `id` bigint UNSIGNED NOT NULL,
  `status_id` bigint UNSIGNED NOT NULL,
  `birth_date` date NOT NULL,
  `profile_pic` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `user_technicians`
--

CREATE TABLE `user_technicians` (
  `id` bigint UNSIGNED NOT NULL,
  `status_id` bigint UNSIGNED NOT NULL,
  `expertise` enum('Mechanical','Electrical','Battery') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Mechanical',
  `year_experience` tinyint UNSIGNED NOT NULL,
  `certificate_prc_no` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `professional_license` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `valid_id_type` enum('National ID','Passport','Driver License','Voter ID','Unified Multi-Purpose ID','TIN ID') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'National ID',
  `valid_id_number` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `front_valid_id_picture` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `back_valid_id_picture` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `cv_attachment` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `birth_date` date NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `user_types`
--

CREATE TABLE `user_types` (
  `id` bigint UNSIGNED NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `user_types`
--

INSERT INTO `user_types` (`id`, `name`) VALUES
(4, 'driver'),
(3, 'manager'),
(2, 'owner'),
(6, 'passenger'),
(1, 'super_admin'),
(5, 'technician');

-- --------------------------------------------------------

--
-- Table structure for table `vehicles`
--

CREATE TABLE `vehicles` (
  `id` bigint UNSIGNED NOT NULL,
  `status_id` bigint UNSIGNED NOT NULL,
  `franchise_id` bigint UNSIGNED DEFAULT NULL,
  `driver_id` bigint UNSIGNED DEFAULT NULL,
  `plate_number` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `vin` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `brand` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `model` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `year` year NOT NULL,
  `color` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `or_cr` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `violations`
--

CREATE TABLE `violations` (
  `id` bigint UNSIGNED NOT NULL,
  `status_id` bigint UNSIGNED NOT NULL,
  `franchise_id` bigint UNSIGNED DEFAULT NULL,
  `driver_id` bigint UNSIGNED NOT NULL,
  `violation_type` enum('Speeding','Reckless Driving','No Seatbelt','Expired License','Illegal Parking','Other') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Other',
  `description` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `violation_date` date NOT NULL,
  `fine_amount` decimal(10,2) NOT NULL,
  `currency` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PHP',
  `due_date` date NOT NULL,
  `paid_date` date DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `action_verifications`
--
ALTER TABLE `action_verifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `action_verifications_user_id_foreign` (`user_id`);

--
-- Indexes for table `boundary_contracts`
--
ALTER TABLE `boundary_contracts`
  ADD PRIMARY KEY (`id`),
  ADD KEY `boundary_contracts_status_id_foreign` (`status_id`),
  ADD KEY `boundary_contracts_franchise_id_foreign` (`franchise_id`),
  ADD KEY `boundary_contracts_driver_id_foreign` (`driver_id`),
  ADD KEY `boundary_contracts_vehicle_id_foreign` (`vehicle_id`);

--
-- Indexes for table `cache`
--
ALTER TABLE `cache`
  ADD PRIMARY KEY (`key`);

--
-- Indexes for table `cache_locks`
--
ALTER TABLE `cache_locks`
  ADD PRIMARY KEY (`key`);

--
-- Indexes for table `chat_messages`
--
ALTER TABLE `chat_messages`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_room` (`room_id`),
  ADD KEY `idx_sender` (`sender_id`);

--
-- Indexes for table `chat_rooms`
--
ALTER TABLE `chat_rooms`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_route` (`route_id`),
  ADD KEY `idx_passenger` (`passenger_id`),
  ADD KEY `idx_driver` (`driver_id`);

--
-- Indexes for table `expenses`
--
ALTER TABLE `expenses`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `expenses_invoice_no_unique` (`invoice_no`),
  ADD KEY `expenses_franchise_id_foreign` (`franchise_id`),
  ADD KEY `expenses_maintenance_id_foreign` (`maintenance_id`);

--
-- Indexes for table `failed_jobs`
--
ALTER TABLE `failed_jobs`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`);

--
-- Indexes for table `feedback`
--
ALTER TABLE `feedback`
  ADD PRIMARY KEY (`id`),
  ADD KEY `feedback_user_type_id_foreign` (`user_type_id`);

--
-- Indexes for table `franchises`
--
ALTER TABLE `franchises`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `franchises_name_unique` (`name`),
  ADD UNIQUE KEY `franchises_email_unique` (`email`),
  ADD UNIQUE KEY `franchises_phone_unique` (`phone`),
  ADD KEY `franchises_owner_id_foreign` (`owner_id`),
  ADD KEY `franchises_manager_id_foreign` (`manager_id`),
  ADD KEY `franchises_status_id_foreign` (`status_id`);

--
-- Indexes for table `franchise_user_driver`
--
ALTER TABLE `franchise_user_driver`
  ADD PRIMARY KEY (`franchise_id`,`user_driver_id`),
  ADD KEY `franchise_user_driver_user_driver_id_foreign` (`user_driver_id`);

--
-- Indexes for table `franchise_user_technician`
--
ALTER TABLE `franchise_user_technician`
  ADD PRIMARY KEY (`franchise_id`,`user_technician_id`),
  ADD KEY `franchise_user_technician_user_technician_id_foreign` (`user_technician_id`);

--
-- Indexes for table `inventories`
--
ALTER TABLE `inventories`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `inventories_code_no_unique` (`code_no`),
  ADD UNIQUE KEY `inventories_name_unique` (`name`),
  ADD KEY `inventories_franchise_id_foreign` (`franchise_id`);

--
-- Indexes for table `jobs`
--
ALTER TABLE `jobs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `jobs_queue_index` (`queue`);

--
-- Indexes for table `job_batches`
--
ALTER TABLE `job_batches`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `maintenances`
--
ALTER TABLE `maintenances`
  ADD PRIMARY KEY (`id`),
  ADD KEY `maintenances_vehicle_id_foreign` (`vehicle_id`),
  ADD KEY `maintenances_inventory_id_foreign` (`inventory_id`),
  ADD KEY `maintenances_status_id_foreign` (`status_id`),
  ADD KEY `maintenances_technician_id_foreign` (`technician_id`);

--
-- Indexes for table `migrations`
--
ALTER TABLE `migrations`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `password_reset_tokens`
--
ALTER TABLE `password_reset_tokens`
  ADD PRIMARY KEY (`email`);

--
-- Indexes for table `payment_options`
--
ALTER TABLE `payment_options`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `payment_options_name_unique` (`name`);

--
-- Indexes for table `percentage_types`
--
ALTER TABLE `percentage_types`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `percentage_types_name_unique` (`name`);

--
-- Indexes for table `ratings`
--
ALTER TABLE `ratings`
  ADD PRIMARY KEY (`id`),
  ADD KEY `ratings_driver_id_foreign` (`driver_id`),
  ADD KEY `ratings_passenger_id_foreign` (`passenger_id`),
  ADD KEY `ratings_route_id_foreign` (`route_id`);

--
-- Indexes for table `report_issue`
--
ALTER TABLE `report_issue`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `revenues`
--
ALTER TABLE `revenues`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `revenues_invoice_no_unique` (`invoice_no`),
  ADD KEY `revenues_status_id_foreign` (`status_id`),
  ADD KEY `revenues_franchise_id_foreign` (`franchise_id`),
  ADD KEY `revenues_driver_id_foreign` (`driver_id`),
  ADD KEY `revenues_boundary_contract_id_foreign` (`boundary_contract_id`),
  ADD KEY `revenues_payment_option_id_foreign` (`payment_option_id`);

--
-- Indexes for table `revenue_breakdowns`
--
ALTER TABLE `revenue_breakdowns`
  ADD PRIMARY KEY (`id`),
  ADD KEY `revenue_breakdowns_revenue_id_foreign` (`revenue_id`),
  ADD KEY `revenue_breakdowns_percentage_type_id_foreign` (`percentage_type_id`);

--
-- Indexes for table `routes`
--
ALTER TABLE `routes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `routes_status_id_foreign` (`status_id`),
  ADD KEY `routes_driver_id_foreign` (`driver_id`),
  ADD KEY `routes_vehicle_id_foreign` (`vehicle_id`),
  ADD KEY `routes_passenger_id_foreign` (`passenger_id`),
  ADD KEY `routes_revenue_id_foreign` (`revenue_id`);

--
-- Indexes for table `sessions`
--
ALTER TABLE `sessions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `sessions_user_id_index` (`user_id`),
  ADD KEY `sessions_last_activity_index` (`last_activity`);

--
-- Indexes for table `statuses`
--
ALTER TABLE `statuses`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `statuses_name_unique` (`name`);

--
-- Indexes for table `support_tickets`
--
ALTER TABLE `support_tickets`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `support_tickets_ticket_code_unique` (`ticket_code`),
  ADD KEY `support_tickets_status_id_foreign` (`status_id`),
  ADD KEY `support_tickets_user_id_foreign` (`user_id`),
  ADD KEY `support_tickets_franchise_id_foreign` (`franchise_id`);

--
-- Indexes for table `tips`
--
ALTER TABLE `tips`
  ADD PRIMARY KEY (`id`),
  ADD KEY `tips_passenger_id_foreign` (`passenger_id`),
  ADD KEY `tips_driver_id_foreign` (`driver_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `users_username_unique` (`username`),
  ADD UNIQUE KEY `users_email_unique` (`email`),
  ADD UNIQUE KEY `users_phone_unique` (`phone`),
  ADD KEY `users_user_type_id_foreign` (`user_type_id`);

--
-- Indexes for table `user_drivers`
--
ALTER TABLE `user_drivers`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `user_drivers_license_number_unique` (`license_number`),
  ADD UNIQUE KEY `user_drivers_code_number_unique` (`code_number`),
  ADD KEY `user_drivers_status_id_foreign` (`status_id`);

--
-- Indexes for table `user_managers`
--
ALTER TABLE `user_managers`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `user_managers_valid_id_number_unique` (`valid_id_number`),
  ADD KEY `user_managers_status_id_foreign` (`status_id`);

--
-- Indexes for table `user_owners`
--
ALTER TABLE `user_owners`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `user_owners_valid_id_number_unique` (`valid_id_number`),
  ADD KEY `user_owners_status_id_foreign` (`status_id`);

--
-- Indexes for table `user_passengers`
--
ALTER TABLE `user_passengers`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_passengers_status_id_foreign` (`status_id`);

--
-- Indexes for table `user_technicians`
--
ALTER TABLE `user_technicians`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `user_technicians_valid_id_number_unique` (`valid_id_number`),
  ADD KEY `user_technicians_status_id_foreign` (`status_id`);

--
-- Indexes for table `user_types`
--
ALTER TABLE `user_types`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `user_types_name_unique` (`name`);

--
-- Indexes for table `vehicles`
--
ALTER TABLE `vehicles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `vehicles_plate_number_unique` (`plate_number`),
  ADD UNIQUE KEY `vehicles_vin_unique` (`vin`),
  ADD KEY `vehicles_status_id_foreign` (`status_id`),
  ADD KEY `vehicles_franchise_id_foreign` (`franchise_id`),
  ADD KEY `vehicles_driver_id_foreign` (`driver_id`);

--
-- Indexes for table `violations`
--
ALTER TABLE `violations`
  ADD PRIMARY KEY (`id`),
  ADD KEY `violations_status_id_foreign` (`status_id`),
  ADD KEY `violations_franchise_id_foreign` (`franchise_id`),
  ADD KEY `violations_driver_id_foreign` (`driver_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `action_verifications`
--
ALTER TABLE `action_verifications`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `boundary_contracts`
--
ALTER TABLE `boundary_contracts`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT for table `chat_messages`
--
ALTER TABLE `chat_messages`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `chat_rooms`
--
ALTER TABLE `chat_rooms`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `expenses`
--
ALTER TABLE `expenses`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `failed_jobs`
--
ALTER TABLE `failed_jobs`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `feedback`
--
ALTER TABLE `feedback`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `franchises`
--
ALTER TABLE `franchises`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `inventories`
--
ALTER TABLE `inventories`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `jobs`
--
ALTER TABLE `jobs`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `maintenances`
--
ALTER TABLE `maintenances`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `migrations`
--
ALTER TABLE `migrations`
  MODIFY `id` int UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=35;

--
-- AUTO_INCREMENT for table `payment_options`
--
ALTER TABLE `payment_options`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `percentage_types`
--
ALTER TABLE `percentage_types`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `ratings`
--
ALTER TABLE `ratings`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=27;

--
-- AUTO_INCREMENT for table `report_issue`
--
ALTER TABLE `report_issue`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `revenues`
--
ALTER TABLE `revenues`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=239;

--
-- AUTO_INCREMENT for table `revenue_breakdowns`
--
ALTER TABLE `revenue_breakdowns`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=273;

--
-- AUTO_INCREMENT for table `routes`
--
ALTER TABLE `routes`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=239;

--
-- AUTO_INCREMENT for table `statuses`
--
ALTER TABLE `statuses`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- AUTO_INCREMENT for table `support_tickets`
--
ALTER TABLE `support_tickets`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `tips`
--
ALTER TABLE `tips`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=44;

--
-- AUTO_INCREMENT for table `user_types`
--
ALTER TABLE `user_types`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `vehicles`
--
ALTER TABLE `vehicles`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT for table `violations`
--
ALTER TABLE `violations`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `action_verifications`
--
ALTER TABLE `action_verifications`
  ADD CONSTRAINT `action_verifications_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `boundary_contracts`
--
ALTER TABLE `boundary_contracts`
  ADD CONSTRAINT `boundary_contracts_driver_id_foreign` FOREIGN KEY (`driver_id`) REFERENCES `user_drivers` (`id`) ON DELETE RESTRICT,
  ADD CONSTRAINT `boundary_contracts_franchise_id_foreign` FOREIGN KEY (`franchise_id`) REFERENCES `franchises` (`id`) ON DELETE RESTRICT,
  ADD CONSTRAINT `boundary_contracts_status_id_foreign` FOREIGN KEY (`status_id`) REFERENCES `statuses` (`id`) ON DELETE RESTRICT,
  ADD CONSTRAINT `boundary_contracts_vehicle_id_foreign` FOREIGN KEY (`vehicle_id`) REFERENCES `vehicles` (`id`) ON DELETE RESTRICT;

--
-- Constraints for table `expenses`
--
ALTER TABLE `expenses`
  ADD CONSTRAINT `expenses_franchise_id_foreign` FOREIGN KEY (`franchise_id`) REFERENCES `franchises` (`id`) ON DELETE RESTRICT,
  ADD CONSTRAINT `expenses_maintenance_id_foreign` FOREIGN KEY (`maintenance_id`) REFERENCES `maintenances` (`id`) ON DELETE RESTRICT;

--
-- Constraints for table `feedback`
--
ALTER TABLE `feedback`
  ADD CONSTRAINT `feedback_user_type_id_foreign` FOREIGN KEY (`user_type_id`) REFERENCES `user_types` (`id`) ON DELETE RESTRICT;

--
-- Constraints for table `franchises`
--
ALTER TABLE `franchises`
  ADD CONSTRAINT `franchises_manager_id_foreign` FOREIGN KEY (`manager_id`) REFERENCES `user_managers` (`id`) ON DELETE RESTRICT,
  ADD CONSTRAINT `franchises_owner_id_foreign` FOREIGN KEY (`owner_id`) REFERENCES `user_owners` (`id`) ON DELETE RESTRICT,
  ADD CONSTRAINT `franchises_status_id_foreign` FOREIGN KEY (`status_id`) REFERENCES `statuses` (`id`) ON DELETE RESTRICT;

--
-- Constraints for table `franchise_user_driver`
--
ALTER TABLE `franchise_user_driver`
  ADD CONSTRAINT `franchise_user_driver_franchise_id_foreign` FOREIGN KEY (`franchise_id`) REFERENCES `franchises` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `franchise_user_driver_user_driver_id_foreign` FOREIGN KEY (`user_driver_id`) REFERENCES `user_drivers` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `franchise_user_technician`
--
ALTER TABLE `franchise_user_technician`
  ADD CONSTRAINT `franchise_user_technician_franchise_id_foreign` FOREIGN KEY (`franchise_id`) REFERENCES `franchises` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `franchise_user_technician_user_technician_id_foreign` FOREIGN KEY (`user_technician_id`) REFERENCES `user_technicians` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `inventories`
--
ALTER TABLE `inventories`
  ADD CONSTRAINT `inventories_franchise_id_foreign` FOREIGN KEY (`franchise_id`) REFERENCES `franchises` (`id`) ON DELETE RESTRICT;

--
-- Constraints for table `maintenances`
--
ALTER TABLE `maintenances`
  ADD CONSTRAINT `maintenances_inventory_id_foreign` FOREIGN KEY (`inventory_id`) REFERENCES `inventories` (`id`) ON DELETE RESTRICT,
  ADD CONSTRAINT `maintenances_status_id_foreign` FOREIGN KEY (`status_id`) REFERENCES `statuses` (`id`) ON DELETE RESTRICT,
  ADD CONSTRAINT `maintenances_technician_id_foreign` FOREIGN KEY (`technician_id`) REFERENCES `user_technicians` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `maintenances_vehicle_id_foreign` FOREIGN KEY (`vehicle_id`) REFERENCES `vehicles` (`id`) ON DELETE RESTRICT;

--
-- Constraints for table `ratings`
--
ALTER TABLE `ratings`
  ADD CONSTRAINT `ratings_driver_id_foreign` FOREIGN KEY (`driver_id`) REFERENCES `user_drivers` (`id`) ON DELETE RESTRICT,
  ADD CONSTRAINT `ratings_passenger_id_foreign` FOREIGN KEY (`passenger_id`) REFERENCES `user_passengers` (`id`) ON DELETE RESTRICT,
  ADD CONSTRAINT `ratings_route_id_foreign` FOREIGN KEY (`route_id`) REFERENCES `routes` (`id`) ON DELETE RESTRICT;

--
-- Constraints for table `revenues`
--
ALTER TABLE `revenues`
  ADD CONSTRAINT `revenues_boundary_contract_id_foreign` FOREIGN KEY (`boundary_contract_id`) REFERENCES `boundary_contracts` (`id`) ON DELETE RESTRICT,
  ADD CONSTRAINT `revenues_driver_id_foreign` FOREIGN KEY (`driver_id`) REFERENCES `user_drivers` (`id`) ON DELETE RESTRICT,
  ADD CONSTRAINT `revenues_franchise_id_foreign` FOREIGN KEY (`franchise_id`) REFERENCES `franchises` (`id`) ON DELETE RESTRICT,
  ADD CONSTRAINT `revenues_payment_option_id_foreign` FOREIGN KEY (`payment_option_id`) REFERENCES `payment_options` (`id`) ON DELETE RESTRICT,
  ADD CONSTRAINT `revenues_status_id_foreign` FOREIGN KEY (`status_id`) REFERENCES `statuses` (`id`) ON DELETE RESTRICT;

--
-- Constraints for table `revenue_breakdowns`
--
ALTER TABLE `revenue_breakdowns`
  ADD CONSTRAINT `revenue_breakdowns_percentage_type_id_foreign` FOREIGN KEY (`percentage_type_id`) REFERENCES `percentage_types` (`id`) ON DELETE RESTRICT,
  ADD CONSTRAINT `revenue_breakdowns_revenue_id_foreign` FOREIGN KEY (`revenue_id`) REFERENCES `revenues` (`id`) ON DELETE RESTRICT;

--
-- Constraints for table `routes`
--
ALTER TABLE `routes`
  ADD CONSTRAINT `routes_driver_id_foreign` FOREIGN KEY (`driver_id`) REFERENCES `user_drivers` (`id`) ON DELETE RESTRICT,
  ADD CONSTRAINT `routes_passenger_id_foreign` FOREIGN KEY (`passenger_id`) REFERENCES `user_passengers` (`id`) ON DELETE RESTRICT,
  ADD CONSTRAINT `routes_revenue_id_foreign` FOREIGN KEY (`revenue_id`) REFERENCES `revenues` (`id`) ON DELETE RESTRICT,
  ADD CONSTRAINT `routes_status_id_foreign` FOREIGN KEY (`status_id`) REFERENCES `statuses` (`id`) ON DELETE RESTRICT,
  ADD CONSTRAINT `routes_vehicle_id_foreign` FOREIGN KEY (`vehicle_id`) REFERENCES `vehicles` (`id`) ON DELETE RESTRICT;

--
-- Constraints for table `support_tickets`
--
ALTER TABLE `support_tickets`
  ADD CONSTRAINT `support_tickets_franchise_id_foreign` FOREIGN KEY (`franchise_id`) REFERENCES `franchises` (`id`) ON DELETE RESTRICT,
  ADD CONSTRAINT `support_tickets_status_id_foreign` FOREIGN KEY (`status_id`) REFERENCES `statuses` (`id`) ON DELETE RESTRICT,
  ADD CONSTRAINT `support_tickets_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT;

--
-- Constraints for table `tips`
--
ALTER TABLE `tips`
  ADD CONSTRAINT `tips_driver_id_foreign` FOREIGN KEY (`driver_id`) REFERENCES `user_drivers` (`id`) ON DELETE RESTRICT,
  ADD CONSTRAINT `tips_passenger_id_foreign` FOREIGN KEY (`passenger_id`) REFERENCES `user_passengers` (`id`) ON DELETE RESTRICT;

--
-- Constraints for table `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `users_user_type_id_foreign` FOREIGN KEY (`user_type_id`) REFERENCES `user_types` (`id`) ON DELETE RESTRICT;

--
-- Constraints for table `user_drivers`
--
ALTER TABLE `user_drivers`
  ADD CONSTRAINT `user_drivers_id_foreign` FOREIGN KEY (`id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `user_drivers_status_id_foreign` FOREIGN KEY (`status_id`) REFERENCES `statuses` (`id`) ON DELETE RESTRICT;

--
-- Constraints for table `user_managers`
--
ALTER TABLE `user_managers`
  ADD CONSTRAINT `user_managers_id_foreign` FOREIGN KEY (`id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `user_managers_status_id_foreign` FOREIGN KEY (`status_id`) REFERENCES `statuses` (`id`) ON DELETE RESTRICT;

--
-- Constraints for table `user_owners`
--
ALTER TABLE `user_owners`
  ADD CONSTRAINT `user_owners_id_foreign` FOREIGN KEY (`id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `user_owners_status_id_foreign` FOREIGN KEY (`status_id`) REFERENCES `statuses` (`id`) ON DELETE RESTRICT;

--
-- Constraints for table `user_passengers`
--
ALTER TABLE `user_passengers`
  ADD CONSTRAINT `user_passengers_id_foreign` FOREIGN KEY (`id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `user_passengers_status_id_foreign` FOREIGN KEY (`status_id`) REFERENCES `statuses` (`id`) ON DELETE RESTRICT;

--
-- Constraints for table `user_technicians`
--
ALTER TABLE `user_technicians`
  ADD CONSTRAINT `user_technicians_id_foreign` FOREIGN KEY (`id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `user_technicians_status_id_foreign` FOREIGN KEY (`status_id`) REFERENCES `statuses` (`id`) ON DELETE RESTRICT;

--
-- Constraints for table `vehicles`
--
ALTER TABLE `vehicles`
  ADD CONSTRAINT `vehicles_driver_id_foreign` FOREIGN KEY (`driver_id`) REFERENCES `user_drivers` (`id`) ON DELETE RESTRICT,
  ADD CONSTRAINT `vehicles_franchise_id_foreign` FOREIGN KEY (`franchise_id`) REFERENCES `franchises` (`id`) ON DELETE RESTRICT,
  ADD CONSTRAINT `vehicles_status_id_foreign` FOREIGN KEY (`status_id`) REFERENCES `statuses` (`id`) ON DELETE RESTRICT;

--
-- Constraints for table `violations`
--
ALTER TABLE `violations`
  ADD CONSTRAINT `violations_driver_id_foreign` FOREIGN KEY (`driver_id`) REFERENCES `user_drivers` (`id`) ON DELETE RESTRICT,
  ADD CONSTRAINT `violations_franchise_id_foreign` FOREIGN KEY (`franchise_id`) REFERENCES `franchises` (`id`) ON DELETE RESTRICT,
  ADD CONSTRAINT `violations_status_id_foreign` FOREIGN KEY (`status_id`) REFERENCES `statuses` (`id`) ON DELETE RESTRICT;

COMMIT;
