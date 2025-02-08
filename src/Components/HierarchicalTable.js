import React, { useRef, useState } from 'react';
import { Button, Form, Table } from 'react-bootstrap';

const HierarchicalTable = ({ data }) => {
	const [rows, setRows] = useState(data.rows);
	const originalData = useRef(JSON.parse(JSON.stringify(data.rows)));

	const calculateSubtotal = (children) => {
		return children.reduce((sum, child) => sum + child.value, 0);
	};

	const calculateVariance = (currentValue, originalValue) => {
		if (originalValue === 0) return 0;
		const difference = currentValue - originalValue;
		return (difference / originalValue) * 100;
	};

	const updateRowValue = (id, newValue, isPercentage) => {
		setRows((prevRows) => {
			const updatedRows = JSON.parse(JSON.stringify(prevRows));
			const originalRows = originalData.current;

			const updateRowRecursively = (rowsToUpdate, originalRowsToUpdate) => {
				return rowsToUpdate.map((row, index) => {
					const originalRow = originalRowsToUpdate[index];
					if (row.id === id) {
						let originalValue = originalRow.value;
						let newCalculatedValue = isPercentage ? row.value + row.value * (newValue / 100) : newValue;

						let variance = calculateVariance(newCalculatedValue, originalValue).toFixed(2);

						if ((!isPercentage || isPercentage) && row.children && row.children.length > 0) {
							const totalOriginalChildrenValue = originalRow.children.reduce((sum, child) => sum + child.value, 0);
							updatedRows[updatedRows.findIndex((r) => r.id === row.id)].children = row.children.map((child, childIndex) => {
								const childOriginalValue = originalRowsToUpdate[index].children[childIndex].value;
								const percentage = totalOriginalChildrenValue === 0 ? 0 : childOriginalValue / totalOriginalChildrenValue;
								const newChildValue = newCalculatedValue * percentage;
								const childVariance = calculateVariance(newChildValue, childOriginalValue).toFixed(2);

								return { ...child, value: newChildValue, variance: childVariance };
							});
						}

						return { ...row, value: newCalculatedValue, variance, inputValue: '' };
					} else if (row.children && row.children.length > 0) {
						const updatedChildren = updateRowRecursively(row.children, originalRow.children);
						const newSubtotal = calculateSubtotal(updatedChildren);
						let originalValue = originalRow.value;
						let variance = calculateVariance(newSubtotal, originalValue).toFixed(2);
						return { ...row, children: updatedChildren, value: newSubtotal, variance };
					}
					return row;
				});
			};

			return updateRowRecursively(updatedRows, originalRows);
		});
	};

	const handleInputChange = (id, event) => {
		setRows((prevRows) => {
			const updatedRows = JSON.parse(JSON.stringify(prevRows));
			const updateInputValue = (rowsToUpdate) => {
				return rowsToUpdate.map((rowInLoop) => {
					if (rowInLoop.id === id) {
						return { ...rowInLoop, inputValue: event.target.value };
					} else if (rowInLoop.children && rowInLoop.children.length > 0) {
						const updatedChildren = updateInputValue(rowInLoop.children);
						return { ...rowInLoop, children: updatedChildren };
					}
					return rowInLoop;
				});
			};
			return updateInputValue(updatedRows);
		});
	};

	const handleAllocationPercent = (id) => {
		const row = findRowById(id, rows);
		updateRowValue(id, parseFloat(row.inputValue), true);
	};

	const handleAllocationValue = (id) => {
		const row = findRowById(id, rows);
		updateRowValue(id, parseFloat(row.inputValue), false);
	};

	const findRowById = (id, rowsToSearch) => {
		for (const row of rowsToSearch) {
			if (row.id === id) {
				return row;
			}
			if (row.children && row.children.length > 0) {
				const foundRow = findRowById(id, row.children);
				if (foundRow) {
					return foundRow;
				}
			}
		}
		return null;
	};

	const renderRow = (row, level = 0) => {
		const indent = '--'.repeat(level);
		return (
			<React.Fragment key={row.id}>
				<tr>
					<td style={{ paddingLeft: `${level * 20}px` }}>
						{indent}
						{row.label}
					</td>
					<td>{row.value.toFixed(2)}</td>
					<td>
						<Form.Control type="number" value={row.inputValue || ''} onChange={(event) => handleInputChange(row.id, event)} />
					</td>
					<td>
						<Button type='button' onClick={() => handleAllocationPercent(row.id)}>Allocation %</Button>
					</td>
					<td>
						<Button type='button' onClick={() => handleAllocationValue(row.id)}>Allocation Val</Button>
					</td>
					<td>{row.variance || 0}%</td>
				</tr>
				{row.children && row.children.length > 0 && row.children.map((child) => renderRow(child, level + 1))}
			</React.Fragment>
		);
	};

	const calculateGrandTotal = () => {
		return rows.reduce((sum, row) => sum + row.value, 0);
	};

	return (
		<Table>
			<thead>
				<tr>
					<th>Label</th>
					<th>Value</th>
					<th>Input</th>
					<th>Allocation %</th>
					<th>Allocation Val</th>
					<th>Variance %</th>
				</tr>
			</thead>
			<tbody>
				{rows.map((row) => renderRow(row))}
				<tr>
					<td>Grand Total</td>
					<td colSpan={5}>{calculateGrandTotal()}</td>
				</tr>
			</tbody>
		</Table>
	);
};

export default HierarchicalTable;
