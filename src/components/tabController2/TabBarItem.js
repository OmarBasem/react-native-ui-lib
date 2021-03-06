import _pt from "prop-types";
// TODO: support commented props
import React, { useCallback, useContext, useEffect, useRef } from 'react';
import { StyleSheet } from 'react-native';
import _ from 'lodash';
import Reanimated, { useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import { Colors, Typography, Spacings } from "../../style";
import Badge, { BADGE_SIZES } from "../badge";
import _TouchableOpacity from "../touchableOpacity";
import TabBarContext from "./TabBarContext";
const TouchableOpacity = Reanimated.createAnimatedComponent(_TouchableOpacity);
const DEFAULT_LABEL_COLOR = Colors.black;
const DEFAULT_SELECTED_LABEL_COLOR = Colors.primary;

/**
 * @description: TabController's TabBarItem
 * @example: https://github.com/wix/react-native-ui-lib/blob/master/demo/src/screens/componentScreens/TabControllerScreen/index.tsx
 * @notes: Must be rendered as a direct child of TabController.TabBar.
 */
export default function TabBarItem({
  index,
  label,
  labelColor,
  selectedLabelColor,
  labelStyle,
  selectedLabelStyle,
  icon,
  badge,
  uppercase,
  activeOpacity = 0.9,
  activeBackgroundColor,
  testID,
  ignore,
  style,
  ...props
}) {
  const {
    currentPage
  } = useContext(TabBarContext);
  const itemRef = useRef();
  const itemWidth = useRef(props.width); // JSON.parse(JSON.stringify is due to an issue with reanimated

  const sharedLabelStyle = useSharedValue(JSON.parse(JSON.stringify(labelStyle)));
  const sharedSelectedLabelStyle = useSharedValue(JSON.parse(JSON.stringify(selectedLabelStyle)));
  useEffect(() => {
    if (itemWidth.current) {
      props.onLayout?.({
        nativeEvent: {
          layout: {
            x: 0,
            y: 0,
            width: itemWidth.current,
            height: 0
          }
        }
      }, index);
    }
  }, []);
  const onPress = useCallback(() => {
    currentPage.value = index;
    props.onPress?.(index);
  }, [index, props.onPress]);
  const onLayout = useCallback(event => {
    const {
      width
    } = event.nativeEvent.layout;

    if (!itemWidth.current && itemRef?.current) {
      itemWidth.current = width; // @ts-ignore

      itemRef.current?.setNativeProps({
        style: {
          width,
          paddingHorizontal: null,
          flex: null
        }
      });
      props.onLayout?.(event, index);
    }
  }, [index, props.onLayout]);
  const animatedLabelStyle = useAnimatedStyle(() => {
    const isActive = currentPage.value === index;
    return isActive ? sharedSelectedLabelStyle.value : sharedLabelStyle.value;
  }, [currentPage]);
  const animatedLabelColorStyle = useAnimatedStyle(() => {
    const isActive = currentPage.value === index;
    const inactiveColor = labelColor || DEFAULT_LABEL_COLOR;
    const activeColor = !ignore ? selectedLabelColor || DEFAULT_SELECTED_LABEL_COLOR : inactiveColor;
    return {
      color: isActive ? activeColor : inactiveColor
    };
  });
  const animatedIconStyle = useAnimatedStyle(() => {
    const isActive = currentPage.value === index;
    const inactiveColor = labelColor || DEFAULT_LABEL_COLOR;
    const activeColor = !ignore ? selectedLabelColor || DEFAULT_SELECTED_LABEL_COLOR : inactiveColor;
    return {
      tintColor: isActive ? activeColor : inactiveColor
    };
  });
  return <TouchableOpacity // @ts-expect-error
  ref={itemRef} style={[styles.tabItem, style]} onLayout={onLayout} activeBackgroundColor={activeBackgroundColor} activeOpacity={activeOpacity} onPress={onPress} testID={testID}>
      {icon && <Reanimated.Image source={icon} style={[!_.isUndefined(label) && styles.tabItemIconWithLabel, animatedIconStyle]} />}
      {!_.isEmpty(label) && <Reanimated.Text style={[styles.tabItemLabel, labelStyle, animatedLabelStyle, animatedLabelColorStyle]}>
          {uppercase ? _.toUpper(label) : label}
        </Reanimated.Text>}
      {badge && <Badge backgroundColor={Colors.red30} size={BADGE_SIZES.default} {...badge} containerStyle={styles.badge} />}
    </TouchableOpacity>;
}
TabBarItem.propTypes = {
  /**
     * label of the tab
     */
  label: _pt.string,

  /**
     * the default label color
     */
  labelColor: _pt.string,

  /**
     * the selected label color
     */
  selectedLabelColor: _pt.string,

  /**
     * icon of the tab
     */
  icon: _pt.number,

  /**
     * icon tint color
     */
  iconColor: _pt.string,

  /**
     * icon selected tint color
     */
  selectedIconColor: _pt.string,

  /**
     * A fixed width for the item
     */
  width: _pt.number,

  /**
     * ignore of the tab
     */
  ignore: _pt.bool,

  /**
     * callback for when pressing a tab
     */
  onPress: _pt.func,

  /**
     * whether to change the text to uppercase
     */
  uppercase: _pt.bool,

  /**
     * The active opacity when pressing a tab
     */
  activeOpacity: _pt.number,

  /**
     * TODO: rename to feedbackColor
     * Apply background color on press for TouchableOpacity
     */
  activeBackgroundColor: _pt.string,

  /**
     * Used as a testing identifier
     */
  testID: _pt.string,
  index: _pt.number.isRequired,
  targetPage: _pt.any.isRequired,
  onLayout: _pt.func
};
const styles = StyleSheet.create({
  tabItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacings.s4
  },
  tabItemLabel: { ...Typography.text80
  },
  tabItemIconWithLabel: {
    marginRight: 10
  },
  badge: {
    marginLeft: Spacings.s1
  }
});