import { useButton } from "@react-aria/button";
import { FocusRing } from "@react-aria/focus";
import { motion, useAnimation } from "framer-motion";
import { useRef } from "react";

export default function AnimatedButton({
  onClick = () => {},
  children,
  disabled,
  className,
  backgroundColor,
  highlightColor,
  ...rest
}) {
  let controls = useAnimation();
  let ref = useRef();
  let { buttonProps } = useButton(
    {
      onPressStart: () => {
        controls.stop();
        controls.set({ background: highlightColor });
      },
      onPressEnd: () => {
        controls.start({
          background: backgroundColor,
          transition: { duration: 0.4 },
        });
      },
      onPress: (event) => {
        onClick(event, controls);
      },
    },
    ref
  );

  return (
    <FocusRing focusRingClass="ring ring-offset-2 ring-offset-black">
      <motion.button
        initial={{ background: backgroundColor }}
        animate={controls}
        {...(!disabled ? buttonProps : {})}
        style={{
          WebkitTapHighlightColor: "transparent",
          touchAction: "none",
          userSelect: "none",
        }}
        className={`focus:outline-none ${className}`}
        {...rest}
      >
        {children}
      </motion.button>
    </FocusRing>
  );
}
