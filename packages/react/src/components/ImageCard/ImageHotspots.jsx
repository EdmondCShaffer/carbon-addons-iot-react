import React, { useCallback, useMemo, useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { InlineLoading } from 'carbon-components-react';
import omit from 'lodash/omit';
import isEmpty from 'lodash/isEmpty';
import warning from 'warning';

import { findMatchingThresholds } from '../../utils/cardUtilityFunctions';
import { settings } from '../../constants/Settings';
import { HotspotIconPropType, HotspotPropTypes } from '../../constants/SharedPropTypes';

import Hotspot from './Hotspot';
import ImageControls from './ImageControls';
import HotspotContent from './HotspotContent';

const { iotPrefix } = settings;

const propTypes = {
  /** id of the local image file to display */
  id: PropTypes.string,
  /** source of the local image file to display */
  src: PropTypes.string,
  /** alt tag and shown on mouseover */
  alt: PropTypes.string,
  /** value for object-fit property - fit, fill, stretch */
  displayOption: PropTypes.string,
  /** optional array of hotspots to render over the image */
  hotspots: PropTypes.arrayOf(PropTypes.shape(HotspotPropTypes)),
  /** optional features to enable or disable */
  hideZoomControls: PropTypes.bool,
  hideHotspots: PropTypes.bool,
  /* deprecated in favor of minimapBehavior below */
  // eslint-disable-next-line consistent-return
  hideMinimap: (props, propName, componentName) => {
    if (__DEV__) {
      const value = props[propName];
      /* istanbul ignore else */
      if (typeof value !== 'undefined') {
        return new Error(
          `${componentName}: '${propName}' prop is deprecated in favor of 'minimapBehavior="${
            value ? 'hide' : 'show'
          }"'.`
        );
      }
    }
  },
  /* 'hide' always hides the minimap, 'show' always shows the minimap, 'showOnPan' only shows the minimap when panning an image */
  minimapBehavior: PropTypes.oneOf(['hide', 'show', 'showOnPan']),
  /** when true activates mouse event based create & select hotspot fuctionality */
  isEditable: PropTypes.bool,
  isHotspotDataLoading: PropTypes.bool,
  /** Background color to display around the image */
  background: PropTypes.string,
  /** Current height in pixels */
  height: PropTypes.number.isRequired,
  /**
   * Array of identifiable icons used by the hotspots. The icons here will be used to
   * render the hotspot icons unless the renderIconByName prop us used.
   */
  icons: PropTypes.arrayOf(HotspotIconPropType),
  /**
   * Callback when an editable image is clicked without drag, used to add hotspot.
   * Emits position obj {x, y} of hotspot to be added.
   */
  onAddHotspotPosition: PropTypes.func,
  /** Callback when a hotspot is clicked in isEditable mode, emits position obj {x, y} */
  onSelectHotspot: PropTypes.func,
  /**
   * Callback when the hotspot content is changed, emits position obj {x, y}
   * and content change obj, e.g. {title: 'new title value'}
   * */
  onHotspotContentChanged: PropTypes.func,
  /** Current width in pixels */
  width: PropTypes.number.isRequired,
  zoomMax: PropTypes.number,
  renderIconByName: PropTypes.func,
  i18n: PropTypes.shape({
    zoomIn: PropTypes.string,
    zoomOut: PropTypes.string,
    zoomToFit: PropTypes.string,
    titlePlaceholderText: PropTypes.string,
    titleEditableHintText: PropTypes.string,
  }),
  /** locale string to pass for formatting */
  locale: PropTypes.string,
  /** The (unique) positions of the currently selected hotspots */
  selectedHotspots: PropTypes.arrayOf(
    PropTypes.shape({ x: PropTypes.number, y: PropTypes.number })
  ),
};

const defaultProps = {
  id: null,
  src: null,
  displayOption: null,
  hotspots: [],
  alt: null,
  hideZoomControls: false,
  hideHotspots: false,
  /* @deprecated in favor of minimapBehavior */
  hideMinimap: undefined,
  minimapBehavior: 'showOnPan',
  isHotspotDataLoading: false,
  isEditable: false,
  onAddHotspotPosition: () => {},
  onSelectHotspot: () => {},
  onHotspotContentChanged: () => {},
  background: '#eee',
  zoomMax: undefined,
  renderIconByName: null,
  i18n: {
    zoomIn: 'Zoom in',
    zoomOut: 'Zoom out',
    zoomToFit: 'Zoom to fit',
    titlePlaceholderText: 'Enter label',
    titleEditableHintText: 'Click to edit label',
  },
  // undefined instead of null allows for functions to set default values
  locale: undefined,
  selectedHotspots: [],
  icons: null,
};

export const prepareDrag = (event, cursor, setCursor) => {
  setCursor({
    ...cursor,
    dragging: false,
    dragPrepared: true,
    imageMousedown: true,
  });

  event.preventDefault();
};

export const startDrag = (event, element, cursor, setCursor) => {
  const cursorX = event.clientX;
  const cursorY = event.clientY;
  /* istanbul ignore else */
  if (element === 'image') {
    setCursor({
      ...cursor,
      cursorX,
      cursorY,
      dragging: true,
      dragPrepared: false,
    });
  }
  event.preventDefault();
};

/** update the image offset based on the dragged point, and the minimap on the relative opposite from the dragged point */
export const whileDrag = (event, cursor, setCursor, image, setImage, minimap, setMinimap) => {
  const cursorX = event.clientX;
  const cursorY = event.clientY;
  const deltaX = cursorX - cursor.cursorX;
  const deltaY = cursorY - cursor.cursorY;
  const newOffsetX = image.offsetX + deltaX;
  const newOffsetY = image.offsetY + deltaY;

  setCursor({
    ...cursor,
    cursorX,
    cursorY,
  });
  setImage({
    ...image,
    offsetX: newOffsetX,
    offsetY: newOffsetY,
  });
  setMinimap({
    ...minimap,
    offsetX: -((minimap.width / image.width) * newOffsetX),
    offsetY: -((minimap.height / image.height) * newOffsetY),
  });
};

/** Make sure that the pointer hasn't left the */
export const stopDrag = (cursor, setCursor) => {
  setCursor({ ...cursor, dragging: false, imageMousedown: false });
};

export const calculateImageWidth = (container, orientation, ratio, scale = 1) =>
  (container.orientation === orientation
    ? orientation === 'landscape'
      ? ratio >= container.ratio
        ? container.width // landscape image bigger than landscape container
        : container.height * ratio // landscape image smaller than landscape container
      : ratio >= container.ratio
      ? container.height / ratio // portrait image bigger than portrait container
      : container.width // portrait image smaller than portrait container
    : orientation === 'landscape'
    ? container.width // landscape image and portrait container
    : container.height / ratio) * scale; // portrait image and landscape container

export const calculateImageHeight = (container, orientation, ratio, scale = 1) =>
  (container.orientation === orientation
    ? orientation === 'landscape'
      ? ratio >= container.ratio
        ? container.width / ratio // landscape image bigger than landscape container
        : container.height // landscape image smaller than landscape container
      : ratio >= container.ratio
      ? container.height // portrait image bigger than portrait container
      : container.width * ratio // portrait image smaller than portrait container
    : orientation === 'landscape'
    ? container.width / ratio // landscape image and portrait container
    : container.height) * scale; // portrait image and landscape container

/**
 *
 * @param {object} container
 * @param {object} image
 * @param {string} displayOption
 * @param {object} imageRef
 * @returns The height and width for both the image and the hotspot container.
 */
export const getLandscapeImageHotspotDimensions = (container, image, displayOption, imageRef) => {
  // This is an interesting case where the image is taller than the container but is still landscape.
  // This causes a need to set the image initially by height: 100% instead of width: 100%
  const isTallerThanContainer = container.height <= image.initialHeight;

  // Let the height be set relative to the width if the image is not stretched or filled by the displayOption
  const imageHeight =
    (displayOption === 'contain' && !isTallerThanContainer) || image.scale !== 1 || !displayOption
      ? 'auto'
      : '100%';

  // If we are zooming (not at scale 1 or stretching/filling) use 100% width to keep the image within the card,
  // else if the image is taller than the container set the width relative to the 100% height
  // else use the natural image width
  const imageWidth =
    displayOption && (displayOption !== 'contain' || image.scale !== 1)
      ? '100%'
      : isTallerThanContainer && image.scale === 1
      ? 'auto'
      : image.width;

  // The hotspots container sits on top of the image, so it needs to match its dimensions.
  // Since the height is set relative to the width in the landscape case (when not stretched or filled),
  // we just need to copy the result of that 'auto' here with the imageRef
  const hotspotHeight =
    (displayOption === 'contain' && !isTallerThanContainer) || image.scale !== 1 || !displayOption
      ? imageRef?.current?.height
      : '100%';

  // Same logic as for the image width, but with the imageRef's width that was set by the "auto" attribute
  const hotspotWidth =
    displayOption && (displayOption !== 'contain' || image.scale !== 1)
      ? '100%'
      : isTallerThanContainer && image.scale === 1
      ? imageRef?.current?.width
      : image.width;

  return { imageHeight, imageWidth, hotspotHeight, hotspotWidth };
};

/**
 *
 * @param {object} container
 * @param {object} image
 * @param {string} displayOption
 * @param {object} imageRef
 * @returns The height and width for botht he image and the hotspot container.
 */
export const getPortraitImageHotspotDimensions = (image, displayOption, imageRef) => {
  // If we're not zooming (ie we're on scale 1), we need to stretch the full height
  const imageHeight = displayOption && image.scale === 1 ? '100%' : image.height;
  // Set width relative to the height if we are not stretched with displayOption or in the hotspot editor (!displayOption)
  const imageWidth = displayOption === 'contain' || !displayOption ? 'auto' : '100%';
  // Same logic for the hotspot dimensions, using imageRef for the value given by the image width: auto
  const hotspotHeight = displayOption && image.scale === 1 ? '100%' : image.height;
  const hotspotWidth =
    displayOption === 'contain' || !displayOption ? imageRef?.current?.width : '100%';
  return { imageHeight, imageWidth, hotspotHeight, hotspotWidth };
};

/** Sets initialWidth and initialHeight of an image, offsets orientations in the state */
export const onImageLoad = (
  { target: imageLoaded },
  container,
  image,
  setImage,
  minimap,
  setMinimap,
  options,
  setOptions
) => {
  const { offsetWidth: initialWidth, offsetHeight: initialHeight } = imageLoaded;
  const orientation = initialWidth > initialHeight ? 'landscape' : 'portrait';
  const ratio =
    orientation === 'landscape' ? initialWidth / initialHeight : initialHeight / initialWidth;

  const width = calculateImageWidth(container, orientation, ratio);
  const height = calculateImageHeight(container, orientation, ratio);

  // Because the first zoom is double, the initial image has to be big enough to support
  const resizable = initialWidth > 2 * width || initialHeight > 2 * height;

  setImage({
    ...image,
    initialWidth,
    initialHeight,
    width,
    height,
    scale: 1,
    ratio,
    orientation,
    offsetX: 0,
    offsetY: container.height / 2 - height / 2,
  });
  setMinimap({
    ...minimap,
    width: orientation === 'landscape' ? minimap.initialSize : minimap.initialSize / ratio,
    height: orientation === 'portrait' ? minimap.initialSize : minimap.initialSize / ratio,
    guideWidth: orientation === 'landscape' ? minimap.initialSize : minimap.initialSize / ratio,
    guideHeight: orientation === 'portrait' ? minimap.initialSize : minimap.initialSize / ratio,
  });
  setOptions({
    ...options,
    hideZoomControls: options.hideZoomControls || !resizable,
    hideMinimap: options.hideMinimap || !resizable,
    resizable,
    draggable: false,
  });
};

/** Updates the image, minimap and options based on the scale of the new zoom.
 * Will not allow scaling beyond zoomMax */
export const zoom = (
  scale,
  zoomMax,
  container,
  image,
  setImage,
  minimap,
  setMinimap,
  options,
  setOptions
) => {
  const width = calculateImageWidth(container, image.orientation, image.ratio, scale);
  const height = calculateImageHeight(container, image.orientation, image.ratio, scale);

  // Reset image position, (i.e. zoom to fit)
  if (scale === 1) {
    setImage({
      ...image,
      width,
      height,
      scale: 1,
      offsetX: 0,
      offsetY: container.height / 2 - height / 2,
    });
    setMinimap({
      ...minimap,
      guideHeight: minimap.height,
      guideWidth: minimap.width,
      offsetX: 0,
      offsetY: 0,
    });
    //
    setOptions({ ...options, draggable: false });
  }
  // Actual zooming in request
  else if (scale > 1) {
    if (
      (zoomMax && scale < zoomMax) ||
      (image.initialWidth > width && image.initialHeight > height)
    ) {
      const guideWidth =
        container.width >= width ? minimap.width : minimap.width / (width / container.width);
      const guideHeight =
        container.height >= height ? minimap.height : minimap.height / (height / container.height);

      const deltaX = Math.round(width - image.width);
      const deltaY = Math.round(height - image.height);
      const guideDeltaX = Math.round(guideWidth - minimap.guideWidth);
      const guideDeltaY = Math.round(guideHeight - minimap.guideHeight);

      const offsetX = image.offsetX - deltaX / 2;
      const offsetY = image.offsetY - deltaY / 2;
      const guideOffsetX = Math.round(minimap.offsetX - guideDeltaX / 2);
      const guideOffsetY = Math.round(minimap.offsetY - guideDeltaY / 2);

      const offsetXMax = -Math.abs(Math.round(container.width - width));
      const offsetYMax = -Math.abs(Math.round(container.height - height));
      const guideOffsetXMax = Math.round(minimap.width - guideWidth);
      const guideOffsetYMax = Math.round(minimap.height - guideHeight);

      // Reset draggability if we're zooming
      setOptions({ ...options, draggable: true });
      setImage({
        ...image,
        width,
        height,
        scale,
        offsetX:
          offsetX >= 0 || container.width > width
            ? 0
            : image.offsetX <= offsetXMax
            ? offsetXMax
            : offsetX,
        offsetY:
          container.height > height
            ? container.height / 2 - height / 2
            : offsetY >= 0
            ? 0
            : image.offsetY < offsetYMax
            ? offsetYMax
            : offsetY,
      });
      setMinimap({
        ...minimap,
        guideWidth,
        guideHeight,
        offsetX:
          guideOffsetX <= 0
            ? 0
            : minimap.offsetX < guideOffsetXMax
            ? guideOffsetX
            : guideOffsetXMax,
        offsetY:
          guideOffsetY <= 0 || height < container.height
            ? 0
            : minimap.offsetY < guideOffsetYMax
            ? guideOffsetY
            : guideOffsetYMax,
      });
    }
  }
};

/**
 * Since the imageElement is not at the borders of the screen, we need to calculate the X and Y offsets of the Image from the parents
 * @param {*} imageElement
 * @return {object} top, left pixels that indicate where the image is placed on the page
 */
export const getAccumulatedOffset = (imageElement) => {
  // TODO: replace with simpler approach and share as utility function: https://stackoverflow.com/questions/5601659/how-do-you-calculate-the-page-position-of-a-dom-element-when-the-body-can-be-rel
  const offset = {
    top: imageElement.offsetTop,
    left: imageElement.offsetLeft,
  };

  let ancestor = imageElement.offsetParent;

  while (ancestor) {
    offset.top += ancestor.offsetTop;
    offset.left += ancestor.offsetLeft;
    ancestor = ancestor.offsetParent;
  }

  return offset;
};

/** Calculates the mouse click position in percentage and returns the
 * result in a callback if a hotspot should be added */
export const handleMouseUp = ({ event, image, cursor, setCursor, isEditable, callback }) => {
  setCursor((newCursor) => {
    return { ...newCursor, dragPrepared: false, imageMousedown: false };
  });

  // We only trigger the callback if the image is editable and the intitiating
  // mouse down event was on the actual image (as oppose of outside).
  if (isEditable && cursor?.imageMousedown) {
    const accumelatedOffset = getAccumulatedOffset(event.currentTarget);
    const relativePosition = {
      x: event.clientX - accumelatedOffset.left,
      y: event.clientY - accumelatedOffset.top,
    };
    const percentagePosition = {
      x: (relativePosition.x / image.width) * 100,
      y: (relativePosition.y / image.height) * 100,
    };
    if (callback) {
      callback(percentagePosition);
    }
  }
};

/** Parent smart component with local state that renders an image with its hotspots */
const ImageHotspots = ({
  hideZoomControls: hideZoomControlsProp,
  hideHotspots: hideHotspotsProp,
  hideMinimap: hideMinimapProp,
  minimapBehavior,
  hotspots,
  i18n,
  background,
  src,
  id,
  height,
  width,
  alt,
  icons,
  isEditable,
  isHotspotDataLoading,
  onAddHotspotPosition,
  onSelectHotspot,
  onHotspotContentChanged,
  zoomMax,
  renderIconByName,
  locale,
  selectedHotspots,
  displayOption,
}) => {
  // Need to keep track of whether the Ctrl key is currently pressed because we want to only add hotspots in that case
  const [isCtrlPressed, setIsCtrlPressed] = useState();
  // Image needs to be stored in state because we're dragging it around when zoomed in, and we need to keep track of when it loads
  const [image, setImage] = useState({});
  // Minimap needs to be stored in state because we're dragging it around when zoomed in
  const [minimap, setMinimap] = useState({
    initialSize: 100,
    offsetX: 0,
    offsetY: 0,
  });
  // TODO: Why do I keep track of cursor state
  const [cursor, setCursor] = useState({});
  // Options need to be stored in state because based on the zoom level they may change
  const [options, setOptions] = useState({
    hideZoomControls: hideZoomControlsProp,
    hideHotspots: hideHotspotsProp,
    hideMinimap: minimapBehavior !== 'show',
  });

  const mergedI18n = useMemo(() => ({ ...defaultProps.i18n, ...i18n }), [i18n]);

  const handleCtrlKeyUp = useCallback((event) => {
    // Was the control key unpressed
    if (event.keyCode === 17) {
      setIsCtrlPressed(false);
    }
  }, []);
  const handleCtrlKeyDown = useCallback((event) => {
    if (event.ctrlKey) {
      setIsCtrlPressed(true);
    }
  }, []);

  // Listen to the control key to add hotspots
  useEffect(() => {
    window.addEventListener('keydown', handleCtrlKeyDown);
    window.addEventListener('keyup', handleCtrlKeyUp);
    return () => {
      window.removeEventListener('keydown', handleCtrlKeyDown);
      window.removeEventListener('keyup', handleCtrlKeyUp);
    };
  }, [handleCtrlKeyDown, handleCtrlKeyUp]);

  useEffect(() => {
    setOptions({
      hideZoomControls: hideZoomControlsProp,
      hideHotspots: hideHotspotsProp,
      hideMinimap: minimapBehavior !== 'show',
    });
  }, [hideZoomControlsProp, hideHotspotsProp, minimapBehavior]);

  const orientation = width > height ? 'landscape' : 'portrait';
  const ratio = orientation === 'landscape' ? width / height : height / width;

  const container = { height, width, ratio, orientation };

  // Once the component mounts set up the container info
  useEffect(
    () => {
      zoom(
        image.scale,
        zoomMax,
        container,
        image,
        setImage,
        minimap,
        setMinimap,
        options,
        setOptions
      );
    },
    // to prevent needing useDeepCompareEffect, since it's an anti-pattern
    // we split out all the various parts needed by the zoom function and check them
    // individually.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      container.height,
      container.width,
      container.ratio,
      container.orientation,
      zoomMax,
      image.initialHeight,
      image.initialWidth,
      image.scale,
      image.orientation,
      image.ratio,
      image.offsetY,
      image.offsetX,
      image.width,
      image.height,
      minimap.initialSize,
      minimap.height,
      minimap.width,
      minimap.guideHeight,
      minimap.guideWidth,
      minimap.offsetX,
      minimap.offsetY,
      options.hideZoomControls,
      options.hideHotspots,
      options.hideMinimap,
      options.resizable,
      options.draggable,
    ]
  );

  const { dragging, dragPrepared } = cursor;
  const { hideZoomControls, hideHotspots, hideMinimap, draggable } = options;
  const imageLoaded = image.initialWidth && image.initialHeight;

  const containerStyle = {
    width: '100%',
    height: '100%',
    position: 'relative',
    overflow: 'hidden',
    textAlign: 'center',
    background,
  };

  const imageRef = useRef(null);

  const imageStyle = {
    cursor: isEditable && !dragging && isCtrlPressed ? 'crosshair' : 'auto',
    position: 'relative',
    left: image.offsetX,
    top: image.offsetY,
    height: image.height,
    width: image.width,
    objectFit: displayOption,
  };

  const hotspotsStyle = {
    position: 'absolute',
    top: image.offsetY,
    left: image.offsetX,
    right: image.offsetX >= 0 ? 0 : 'auto',
    margin: 'auto',
    pointerEvents: 'none',
  };

  const onHotspotClicked = useCallback(
    (evt, position) => {
      // It is possible to receive two events here, one Mouse event and one Pointer event.
      // When used in the ImageHotspots component the Pointer event can somehow be from a
      // previously clicked hotspot. See https://github.com/carbon-design-system/carbon-addons-iot-react/issues/1803
      const isPointerEventOfTypeMouse = evt?.pointerType === 'mouse';
      if (!isPointerEventOfTypeMouse && isEditable) {
        onSelectHotspot(position);
      }
    },
    [onSelectHotspot, isEditable]
  );

  const getIconRenderFunction = useCallback(() => {
    return (
      renderIconByName ||
      (Array.isArray(icons)
        ? (name, props) => {
            const Icon = icons.find((iconObj) => iconObj.id === name)?.icon;
            if (!Icon) {
              if (__DEV__) {
                warning(
                  false,
                  `An array of available icons was provided to the ImageHotspots but a hotspot was trying to use an icon with name '${name}' that was not found in that array.`
                );
              }
              return null;
            }
            return <Icon {...props} />;
          }
        : null)
    );
  }, [icons, renderIconByName]);

  // Performance improvement
  const cachedHotspots = useMemo(
    () =>
      hotspots.map((hotspot, index) => {
        const { x, y } = hotspot;
        const hotspotIsSelected = !!selectedHotspots.find((pos) => x === pos.x && y === pos.y);
        // Determine whether the icon needs to be dynamically overridden by a threshold
        const matchingAttributeThresholds = [];
        if (hotspot.content?.attributes) {
          hotspot.content.attributes.forEach(({ thresholds, dataSourceId }) => {
            if (!isEmpty(thresholds) && !isEmpty(hotspot.content?.values)) {
              const attributeThresholds = findMatchingThresholds(
                thresholds.map((threshold) => ({ ...threshold, dataSourceId })),
                hotspot.content?.values,
                dataSourceId
              );
              matchingAttributeThresholds.push(...attributeThresholds);
            }
          });
        }
        return (
          <Hotspot
            {...omit(hotspot, 'content')}
            content={
              React.isValidElement(hotspot.content) ? (
                hotspot.content
              ) : (
                <HotspotContent
                  {...hotspot.content}
                  locale={locale}
                  renderIconByName={getIconRenderFunction()}
                  id={`hotspot-content-${x}-${y}`}
                  isTitleEditable={(isEditable, hotspotIsSelected && hotspot.type === 'text')}
                  onChange={onHotspotContentChanged}
                  i18n={mergedI18n}
                />
              )
            }
            icon={
              !isEmpty(matchingAttributeThresholds)
                ? matchingAttributeThresholds[0].icon
                : hotspot.icon
            }
            color={
              !isEmpty(matchingAttributeThresholds)
                ? matchingAttributeThresholds[0].color
                : hotspot.color
            }
            key={`${x}-${y}-${index}`}
            style={hotspotsStyle}
            renderIconByName={getIconRenderFunction()}
            isSelected={hotspotIsSelected}
            onClick={onHotspotClicked}
          />
        );
      }),
    [
      hotspots,
      selectedHotspots,
      locale,
      getIconRenderFunction,
      isEditable,
      onHotspotContentChanged,
      mergedI18n,
      hotspotsStyle,
      onHotspotClicked,
    ]
  );

  // Wait for the image to be loaded so that we can calculate height and width
  if (imageLoaded) {
    if (image.orientation === 'landscape') {
      const {
        imageHeight,
        imageWidth,
        hotspotHeight,
        hotspotWidth,
      } = getLandscapeImageHotspotDimensions(container, image, displayOption, imageRef);
      imageStyle.height = imageHeight;
      imageStyle.width = imageWidth;
      hotspotsStyle.height = hotspotHeight;
      hotspotsStyle.width = hotspotWidth;
    } else {
      const {
        imageHeight,
        imageWidth,
        hotspotHeight,
        hotspotWidth,
      } = getPortraitImageHotspotDimensions(image, displayOption, imageRef);
      imageStyle.height = imageHeight;
      imageStyle.width = imageWidth;
      hotspotsStyle.height = hotspotHeight;
      hotspotsStyle.width = hotspotWidth;
    }
  }

  /* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
  return (
    <div
      onContextMenu={
        isEditable
          ? (event) => {
              // if we're in edit mode, prevent the CTRL-click context menu from popping
              event.preventDefault();
            }
          : undefined
      }
      style={containerStyle}
      onMouseOut={() => {
        if (dragging) {
          // If we leave the container, stop detecting the drag
          stopDrag(cursor, setCursor);
        }
      }}
      onBlur={() => {
        if (dragging) {
          // If we leave the container, stop detecting the drag
          stopDrag(cursor, setCursor);
        }
      }}
    >
      {src && (
        <img
          key={`image-card-image--${displayOption}`} // need to regen here so that our ref updates
          ref={imageRef}
          id={id}
          className={`${iotPrefix}--image-card-img`}
          src={src}
          alt={alt}
          onLoad={(event) =>
            onImageLoad(event, container, image, setImage, minimap, setMinimap, options, setOptions)
          }
          style={imageStyle}
          onMouseDown={(evt) => {
            if (!hideZoomControls && draggable) {
              prepareDrag(evt, cursor, setCursor);
            } else {
              setCursor({
                ...cursor,
                imageMousedown: true,
              });
            }
          }}
          onMouseMove={(evt) => {
            if (!hideZoomControls && draggable && dragPrepared) {
              startDrag(evt, 'image', cursor, setCursor);
            } else if (!hideZoomControls && dragging) {
              whileDrag(evt, cursor, setCursor, image, setImage, minimap, setMinimap);
            }
          }}
          onMouseUp={(event) => {
            if (dragging) {
              stopDrag(cursor, setCursor);
            } else {
              handleMouseUp({
                event,
                image,
                cursor,
                setCursor,
                isEditable,
                callback: event.ctrlKey ? onAddHotspotPosition : undefined,
              });
            }
          }}
        />
      )}
      {isHotspotDataLoading ? (
        <InlineLoading
          style={{ position: 'absolute', top: 0 }}
          description="Loading hotspot data..."
          status="active"
        />
      ) : null}
      {!isHotspotDataLoading && !hideHotspots && hotspots && (
        <div key={`image-hotspots--${displayOption}`} style={hotspotsStyle}>
          {cachedHotspots}
        </div>
      )}
      {!hideZoomControls && (
        <ImageControls
          i18n={mergedI18n}
          minimap={{ ...minimap, src }}
          draggable={draggable}
          dragging={dragging}
          hideMinimap={minimapBehavior === 'showOnPan' ? !dragging || hideMinimapProp : hideMinimap}
          onZoomToFit={() =>
            zoom(1, zoomMax, container, image, setImage, minimap, setMinimap, options, setOptions)
          }
          onZoomIn={() =>
            zoom(
              image.scale + 1,
              zoomMax,
              container,
              image,
              setImage,
              minimap,
              setMinimap,
              options,
              setOptions
            )
          }
          onZoomOut={() =>
            zoom(
              image.scale - 1,
              zoomMax,
              container,
              image,
              setImage,
              minimap,
              setMinimap,
              options,
              setOptions
            )
          }
        />
      )}
    </div>
  );
};

ImageHotspots.propTypes = propTypes;
ImageHotspots.defaultProps = defaultProps;

export default ImageHotspots;
