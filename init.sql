CREATE USER mahjongranking@localhost IDENTIFIED BY 'mahjongrankingservice001';
CREATE DATABASE mahjongranking;
USE mahjongranking;
CREATE TABLE `accounts` (
  `ID` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `UserID` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `UserName` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `Password` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `AccountLevel` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
ALTER TABLE `accounts`
  ADD PRIMARY KEY (`ID`),
  ADD UNIQUE KEY `accounts_ID_key` (`ID`),
  ADD UNIQUE KEY `accounts_UserID_key` (`UserID`);
GRANT INSERT,UPDATE,SELECT,DELETE ON mahjongranking.* TO mahjongranking@localhost;
