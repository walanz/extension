/**
 * 验证以太坊地址格式
 * 要求以0x开头，后跟40个16进制字符
 */
export const isValidEthAddress = (address: string): boolean => {
  // 检查为空
  if (!address) return false;
  
  // 检查是否为有效的以太坊地址格式
  return /^0x[0-9a-fA-F]{40}$/.test(address);
};

/**
 * 验证ENS域名
 * 简单检查是否以.eth结尾
 */
export const isValidEns = (address: string): boolean => {
  return address.trim().toLowerCase().endsWith('.eth');
};

/**
 * 综合验证钱包地址或ENS
 */
export const isValidWalletInput = (input: string): boolean => {
  return isValidEthAddress(input) || isValidEns(input);
}; 