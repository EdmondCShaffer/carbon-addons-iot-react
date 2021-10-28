import React from 'react';
import classnames from 'classnames';
import PropTypes from 'prop-types';

import { EditingStyle, DropLocation } from '../../../utils/DragAndDropUtils';
import { settings } from '../../../constants/Settings';

import ListTarget, { TargetSize } from './ListTarget';

const { iotPrefix } = settings;

const ListItemWrapper = ({
  id,
  editingStyle,
  expanded,
  isSelectable,
  itemWillMove,
  onItemMoved,
  onSelect,
  selected,
  isDragging,
  renderDropTargets,
  isLargeRow,
  children,
  connectDragSource,
  disabled,
}) => {
  const body =
    isSelectable && !disabled ? (
      <div
        role="button"
        tabIndex={0}
        className={classnames(
          `${iotPrefix}--list-item`,
          `${iotPrefix}--list-item__selectable`,
          {
            [`${iotPrefix}--list-item__selected`]: editingStyle ? false : selected,
          },
          { [`${iotPrefix}--list-item__large`]: isLargeRow },
          { [`${iotPrefix}--list-item-editable`]: editingStyle }
        )}
        data-testid={selected ? 'list-item__selected' : null}
        onKeyPress={({ key }) => key === 'Enter' && onSelect(id)}
        onClick={() => {
          onSelect(id);
        }}
      >
        {children}
      </div>
    ) : (
      <div
        className={classnames(`${iotPrefix}--list-item`, {
          [`${iotPrefix}--list-item__large`]: isLargeRow,
          [`${iotPrefix}--list-item-editable`]: editingStyle,
        })}
      >
        {children}
      </div>
    );

  if (editingStyle) {
    const canNest =
      editingStyle === EditingStyle.SingleNesting || editingStyle === EditingStyle.MultipleNesting;

    return (
      <div
        role="listitem"
        className={classnames(`${iotPrefix}--list-item-editable--drag-container`, {
          [`${iotPrefix}--list-item-editable--dragging`]: isDragging,
        })}
        ref={(instance) => {
          if (connectDragSource) {
            connectDragSource(instance);
          }
        }}
      >
        {renderDropTargets && (
          <div
            className={classnames(`${iotPrefix}--list-item-editable--drop-targets`, {
              [`${iotPrefix}--list-item__large`]: isLargeRow,
            })}
          >
            {
              // Renders Nested location only if nesting is allowed

              canNest ? (
                <ListTarget
                  id={id}
                  targetPosition={DropLocation.Nested}
                  targetSize={TargetSize.Full}
                  itemWillMove={itemWillMove}
                  onItemMoved={onItemMoved}
                />
              ) : null
            }

            <ListTarget
              id={id}
              targetPosition={DropLocation.Above}
              itemWillMove={itemWillMove}
              targetSize={canNest ? TargetSize.Third : TargetSize.Half}
              onItemMoved={onItemMoved}
            />

            <ListTarget
              id={id}
              targetPosition={DropLocation.Below}
              itemWillMove={itemWillMove}
              targetOverride={expanded ? DropLocation.Nested : null} // If item is expanded then the bottom target will nest
              targetSize={canNest ? TargetSize.Third : TargetSize.Half}
              onItemMoved={onItemMoved}
            />
          </div>
        )}
        {body}
      </div>
    );
  }

  return body;
};

const ListItemWrapperProps = {
  dragPreviewText: PropTypes.string,
  id: PropTypes.string.isRequired,
  editingStyle: PropTypes.oneOf([
    EditingStyle.Single,
    EditingStyle.Multiple,
    EditingStyle.SingleNesting,
    EditingStyle.MultipleNesting,
  ]),
  expanded: PropTypes.bool.isRequired,
  isLargeRow: PropTypes.bool.isRequired,
  isSelectable: PropTypes.bool.isRequired,
  isDragging: PropTypes.bool.isRequired,
  onSelect: PropTypes.func.isRequired,
  renderDropTargets: PropTypes.bool.isRequired,
  selected: PropTypes.bool.isRequired,
  children: PropTypes.node.isRequired,
  onItemMoved: PropTypes.func.isRequired,
  itemWillMove: PropTypes.func.isRequired,
};

ListItemWrapper.propTypes = ListItemWrapperProps;

export default ListItemWrapper;
