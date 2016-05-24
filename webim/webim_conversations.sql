/*
Navicat MySQL Data Transfer

Source Server         : 127.0.0.1
Source Server Version : 50151
Source Host           : 127.0.0.1:3306
Source Database       : webim5

Target Server Type    : MYSQL
Target Server Version : 50151
File Encoding         : 65001

Date: 2016-05-11 13:52:38
*/

SET FOREIGN_KEY_CHECKS=0;

-- ----------------------------
-- Table structure for `webim_conversations`
-- ----------------------------
DROP TABLE IF EXISTS `webim_conversations`;
CREATE TABLE `webim_conversations` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `uid` varchar(50) COLLATE utf8_bin DEFAULT NULL,
  `oid` varchar(50) COLLATE utf8_bin DEFAULT NULL,
  `body` text COLLATE utf8_bin,
  `created` datetime DEFAULT NULL,
  `updated` datetime DEFAULT NULL,
  `type` varchar(20) COLLATE utf8_bin DEFAULT NULL,
  `direction` varchar(10) COLLATE utf8_bin DEFAULT NULL,
  `name` varchar(20) COLLATE utf8_bin DEFAULT NULL,
  `avatar` varchar(100) COLLATE utf8_bin DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8 COLLATE=utf8_bin;

-- ----------------------------
-- Records of webim_conversations
-- ----------------------------

ALTER TABLE `webim_conversations`
CHANGE COLUMN `name` `oname`  varchar(20) CHARACTER SET utf8 COLLATE utf8_bin NULL DEFAULT NULL AFTER `direction`,
CHANGE COLUMN `avatar` `oavatar`  varchar(300) CHARACTER SET utf8 COLLATE utf8_bin NULL DEFAULT NULL AFTER `oname`;
