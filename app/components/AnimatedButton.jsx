import { useButton } from "@react-aria/button";
import { FocusRing } from "@react-aria/focus";
import { motion, useAnimation } from "framer-motion";
import { useRef } from "react";
import Spinner from "./Spinner";

export default function AnimatedButton({
  onClick = () => {},
  children,
  disabled,
  isSaving,
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

  let notInteractive = disabled || isSaving;

  return (
    <FocusRing focusRingClass="ring ring-offset-2 ring-offset-black">
      <motion.button
        {...(notInteractive ? {} : buttonProps)}
        initial={{ background: backgroundColor }}
        animate={controls}
        disabled={notInteractive}
        style={{
          WebkitTapHighlightColor: "transparent",
          touchAction: "none",
          userSelect: "none",
        }}
        className={`relative focus:outline-none ${className}`}
        {...rest}
      >
        <span className={isSaving ? "opacity-0" : ""}>{children}</span>
        {isSaving && (
          <span className="absolute inset-0 flex items-center justify-center">
            <Spinner
              style={{ animationTimingFunction: "steps(12, end)" }}
              className="h-1/2 animate-spin"
            />
          </span>
        )}
      </motion.button>
    </FocusRing>
  );
}
