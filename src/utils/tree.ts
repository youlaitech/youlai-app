/**
 * 查找从根到目标选项的完整路径，未找到返回 null
 * 按字符串比较节点值，兼容字符串与数字 ID
 */
export function findOptionChain(
  options: OptionType[],
  targetValue: string | number,
): OptionType[] | null {
  for (const option of options) {
    if (String(option.value) === String(targetValue)) {
      return [option];
    }
    if (option.children?.length) {
      const chain = findOptionChain(option.children, targetValue);
      if (chain) {
        return [option, ...chain];
      }
    }
  }
  return null;
}

/**
 * 递归转换树节点，保留原有父子关系
 *
 * @param node 节点转换函数，叶子节点的 children 为空数组
 */
export function toTree<TSource, TNode>(
  items: TSource[],
  getChildren: (item: TSource) => TSource[] | undefined,
  node: (item: TSource, children: TNode[]) => TNode,
): TNode[] {
  return items.map((item) => node(item, toTree(getChildren(item) ?? [], getChildren, node)));
}
